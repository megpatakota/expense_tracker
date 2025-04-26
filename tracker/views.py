from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from .models import MonthlyEntry
from datetime import date
import calendar
from decimal import Decimal
from django.views.decorators.csrf import csrf_exempt
import json
from django.db.models import Sum, Q
from typing import Dict, List, Tuple, Any, Optional


# Constants
BASE_ACCOUNTS = [
    {'bank': 'Barclays', 'account': 'Main Account', 'type': 'Current', 'amount': 0},
    {'bank': 'Barclays', 'account': 'Joint Account', 'type': 'Current', 'amount': 0},
    {'bank': 'Lloyds', 'account': 'Credit Card', 'type': 'Current', 'amount': 0},
    {'bank': 'HSBC', 'account': 'Flex Account', 'type': 'Current', 'amount': 0},
    {'bank': 'Barclays', 'account': 'Rainy Day', 'type': 'Savings', 'amount': 0},
    {'bank': 'Barclays', 'account': 'ISA', 'type': 'Savings', 'amount': 0},
    {'bank': 'Lloyds', 'account': 'Easy Saver', 'type': 'Savings', 'amount': 0},
    {'bank': 'Family', 'account': 'Personal Loan', 'type': 'Lending', 'amount': 0},
    {'bank': 'Deanston Building', 'account': 'Deposit till Apr 26', 'type': 'Deposits', 'amount': 0},
    {'bank': 'RetireReady', 'account': 'Pension Fund', 'type': 'Pensions', 'amount': 0},
    {'bank': 'Lloyds Cashback', 'account': 'Credit Card', 'type': 'Credit Cards', 'amount': 0},
    {'bank': 'Barclaycard', 'account': 'Credit Card', 'type': 'Credit Cards', 'amount': 0},
]

ACCOUNT_TYPES = ['Current', 'Savings', 'Lending', 'Deposits', 'Pensions', 'Credit Cards']
DEFAULT_YEAR = 2025


# Helper functions
def calculate_totals(entries_queryset) -> Dict[str, float]:
    """Calculate totals for all account types from a queryset"""
    totals = {}
    
    # Calculate totals for each account type
    for account_type in ACCOUNT_TYPES:
        type_total = sum(e.amount for e in entries_queryset.filter(account_type=account_type))
        totals[f"{account_type.lower().replace(' ', '_')}_total"] = float(type_total)
    
    # Calculate grand total (credit cards are liabilities so subtract them)
    grand_total = (
        totals.get('current_total', 0) + 
        totals.get('savings_total', 0) + 
        totals.get('lending_total', 0) + 
        totals.get('deposits_total', 0) + 
        totals.get('pensions_total', 0) - 
        totals.get('credit_cards_total', 0)
    )
    totals['grand_total'] = float(grand_total)
    
    return totals


def get_month_key(month_date: date) -> str:
    """Generate a consistent month key string"""
    return f"{calendar.month_name[month_date.month]} {month_date.year}"


def group_entries_by_month(entries_queryset) -> Dict[str, Dict]:
    """Group entries by month and account type"""
    entries_by_month = {}
    
    for entry in entries_queryset:
        month_date = entry.date.replace(day=1)
        month_key = get_month_key(month_date)
        
        if month_key not in entries_by_month:
            entries_by_month[month_key] = {
                'month_date': month_date,
                **{account_type.lower().replace(' ', '_'): [] for account_type in ACCOUNT_TYPES}
            }
        
        # Add entry to appropriate list based on account type
        account_type_key = entry.account_type.lower().replace(' ', '_')
        if account_type_key in entries_by_month[month_key]:
            entries_by_month[month_key][account_type_key].append(entry)
    
    return entries_by_month


def create_entries_for_month(month_date: date, template_entries=None) -> None:
    """Create entries for a specific month based on template or BASE_ACCOUNTS"""
    if template_entries:
        # Copy from template entries
        for entry in template_entries:
            MonthlyEntry.objects.create(
                date=month_date,
                bank_name=entry.bank_name,
                account_name=entry.account_name,
                account_type=entry.account_type,
                amount=entry.amount,
                notes=""
            )
    else:
        # Create from BASE_ACCOUNTS template
        for account in BASE_ACCOUNTS:
            MonthlyEntry.objects.create(
                date=month_date,
                bank_name=account['bank'],
                account_name=account['account'],
                account_type=account['type'],
                amount=account['amount'],
                notes=""
            )


# Data management functions
def generate_year_data(year: int = DEFAULT_YEAR) -> None:
    """Generate test data for all months of specified year if they don't exist"""
    # Check if data for January exists (as a test for any data)
    if MonthlyEntry.objects.filter(date__year=year).exists():
        # Some data exists, make sure all months are covered
        ensure_all_months_exist(year)
        return

    # Generate account data for each month
    for month in range(1, 13):
        month_date = date(year, month, 1)
        create_entries_for_month(month_date)


def ensure_all_months_exist(year: int = DEFAULT_YEAR) -> None:
    """Make sure all months of the specified year have data"""
    for month in range(1, 13):
        month_date = date(year, month, 1)
        
        # Check if any data exists for this month
        if not MonthlyEntry.objects.filter(date__year=year, date__month=month).exists():
            # No data for this month, copy from the most recent previous month
            copy_from_previous_month(month_date)


def copy_from_previous_month(target_date: date) -> None:
    """Copy entries from the most recent previous month to the target month"""
    # Find the most recent month before target_date that has entries
    existing_months = MonthlyEntry.objects.filter(date__lt=target_date).dates('date', 'month', order='DESC')
    
    if existing_months:
        prev_month_date = existing_months[0]
        prev_entries = MonthlyEntry.objects.filter(
            date__year=prev_month_date.year, 
            date__month=prev_month_date.month
        )
        create_entries_for_month(target_date, prev_entries)
    else:
        # No previous months exist, create default template
        create_entries_for_month(target_date)


# View functions
def entry_form(request):
    """Main view for displaying and managing entries"""
    # Generate data for all months of DEFAULT_YEAR
    generate_year_data()
    
    # Get all entries ordered by date, bank, and account name
    entries = MonthlyEntry.objects.all().order_by('date', 'bank_name', 'account_name')
    
    # Group entries by month
    entries_by_month = group_entries_by_month(entries)
    
    # Current month and year
    today = date.today()
    current_month = today.month
    
    # Prepare data for current year months to show in horizontal scroller
    current_year_months = []
    for month in range(1, 13):
        month_date = date(DEFAULT_YEAR, month, 1)
        month_key = get_month_key(month_date)
        
        if month_key in entries_by_month:
            month_data = entries_by_month[month_key]
            
            # Create a copy with the current month flag
            month_data_copy = month_data.copy()
            month_data_copy['is_current'] = (month == current_month)
            
            current_year_months.append((month_key, month_data_copy))
    
    # Sort months chronologically
    current_year_months.sort(key=lambda x: x[1]['month_date'].month)
    
    # Get the complete list of all data (for chart and hidden data)
    sorted_months = sorted(
        entries_by_month.items(), 
        key=lambda x: x[1]['month_date'],
        reverse=True
    )
    
    return render(request, 'tracker/entry_form.html', {
        'entries_by_month': sorted_months,
        'current_year_months': current_year_months,
    })


@csrf_exempt
def update_amount(request, entry_id):
    """AJAX endpoint to update an entry amount"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid request method'})
    
    try:
        data = json.loads(request.body)
        entry = get_object_or_404(MonthlyEntry, id=entry_id)
        entry.amount = Decimal(data.get('amount', 0))
        entry.save()
        
        # Get all entries for the same month to recalculate totals
        month_entries = MonthlyEntry.objects.filter(
            date__year=entry.date.year,
            date__month=entry.date.month
        )
        
        # Calculate totals
        totals = calculate_totals(month_entries)
        
        # Return response with updated data
        return JsonResponse({
            'success': True, 
            'id': entry.id,
            'amount': float(entry.amount),
            **totals
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


def add_account(request):
    """Add a new account to all months"""
    if request.method != 'POST':
        return redirect('entry_form')
    
    bank_name = request.POST.get('bank_name')
    account_name = request.POST.get('account_name')
    account_type = request.POST.get('account_type')
    
    if not all([bank_name, account_name, account_type]):
        return redirect('entry_form')
    
    # Get all unique months in the system
    distinct_dates = MonthlyEntry.objects.dates('date', 'month', order='DESC')
    
    # Add this account to all months
    for month_date in distinct_dates:
        # Check if this account already exists for this month
        if not MonthlyEntry.objects.filter(
            date__year=month_date.year,
            date__month=month_date.month,
            bank_name=bank_name,
            account_name=account_name
        ).exists():
            # Create new entry
            MonthlyEntry.objects.create(
                date=month_date,
                bank_name=bank_name,
                account_name=account_name,
                account_type=account_type,
                amount=0,
                notes=""
            )
    
    return redirect('entry_form')


def reset_data(request):
    """Helper view to reset all data"""
    if request.method == 'POST':
        # Delete all existing entries
        MonthlyEntry.objects.all().delete()
        # Regenerate data
        generate_year_data()
        return redirect('entry_form')
    return render(request, 'tracker/reset_confirm.html')


@csrf_exempt
def update_account(request, entry_id):
    """AJAX endpoint to update account details (bank name and account name)"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid request method'})
    
    try:
        data = json.loads(request.body)
        entry = get_object_or_404(MonthlyEntry, id=entry_id)
        
        # Get current details for comparison
        old_bank_name = entry.bank_name
        old_account_name = entry.account_name
        
        # Update the entry with new details
        entry.bank_name = data.get('bank_name', old_bank_name)
        entry.account_name = data.get('account_name', old_account_name)
        entry.save()
        
        # Update other entries for the same account across all months if requested
        if data.get('update_all_months', True):
            MonthlyEntry.objects.filter(
                bank_name=old_bank_name,
                account_name=old_account_name
            ).exclude(id=entry_id).update(
                bank_name=entry.bank_name,
                account_name=entry.account_name
            )
        
        return JsonResponse({
            'success': True,
            'id': entry.id,
            'bank_name': entry.bank_name,
            'account_name': entry.account_name
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})


@csrf_exempt
def delete_account(request, entry_id):
    """AJAX endpoint to delete an account"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Invalid request method'})
    
    try:
        entry = get_object_or_404(MonthlyEntry, id=entry_id)
        
        # Store details for finding similar entries
        bank_name = entry.bank_name
        account_name = entry.account_name
        month_date = entry.date
        
        # Delete the entry
        entry.delete()
        
        # Find and delete all similar entries across all months if requested
        if request.GET.get('all_months', 'true').lower() == 'true':
            MonthlyEntry.objects.filter(
                bank_name=bank_name,
                account_name=account_name
            ).delete()
        
        # Recalculate totals for the affected month
        month_entries = MonthlyEntry.objects.filter(
            date__year=month_date.year,
            date__month=month_date.month
        )
        
        # Calculate totals
        totals = calculate_totals(month_entries)
        
        return JsonResponse({
            'success': True,
            'month': get_month_key(month_date),
            'totals': totals
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})