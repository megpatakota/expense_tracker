from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from .models import MonthlyEntry
from django import forms
from datetime import date, timedelta, datetime
import calendar
from decimal import Decimal
from django.views.decorators.csrf import csrf_exempt
import json
from django.core.serializers.json import DjangoJSONEncoder
import random

def generate_year_data():
    """Generate test data for all months of 2025 if they don't exist"""
    current_year = 2025  # We're focusing only on 2025
    
    # Check if data for January 2025 exists (as a test for any data)
    jan_date = date(current_year, 1, 1)
    if MonthlyEntry.objects.filter(date__year=current_year).exists():
        # Some data exists for this year, make sure all months are covered
        ensure_all_months_exist(current_year)
        return
    
    # Sample accounts structure
    base_accounts = [
        {'bank': 'Barclays', 'account': 'Main Account', 'type': 'Current', 'base_amount': 0},
        {'bank': 'Barclays', 'account': 'Joint Account', 'type': 'Current', 'base_amount': 0},
        {'bank': 'Barclays', 'account': 'Rainy Day', 'type': 'Savings', 'base_amount': 0},
        {'bank': 'Barclays', 'account': 'ISA', 'type': 'Savings', 'base_amount': 0},
        {'bank': 'HSBC', 'account': 'Flex Account', 'type': 'Current', 'base_amount': 0},
        {'bank': 'Lloyds', 'account': 'Easy Saver', 'type': 'Savings', 'base_amount': 0},
        {'bank': 'Lloyds', 'account': 'Credit Card', 'type': 'Current', 'base_amount': 0},
        {'bank': 'Family', 'account': 'Personal Loan', 'type': 'Lending', 'base_amount': 0},  # Add example lending account
    ]
    
    # SET DEFAULTS: Generate account data for each month of 2025
    for month in range(1, 13):
        month_date = date(current_year, month, 1)
        
        for account in base_accounts:
            MonthlyEntry.objects.create(
                date=month_date,
                bank_name=account['bank'],
                account_name=account['account'],
                account_type=account['type'],
                amount=0,
                notes=f"{calendar.month_name[month]} {current_year} value"
            )

def ensure_all_months_exist(year=2025):
    """Make sure all months of the specified year have data"""
    for month in range(1, 13):
        month_date = date(year, month, 1)
        
        # Check if any data exists for this month
        if not MonthlyEntry.objects.filter(date__year=year, date__month=month).exists():
            # No data for this month, copy from the most recent previous month
            copy_from_previous_month(month_date)

def copy_from_previous_month(target_date):
    """Copy entries from the most recent previous month to the target month"""
    # Find the most recent month before target_date that has entries
    existing_months = MonthlyEntry.objects.filter(date__lt=target_date).dates('date', 'month', order='DESC')
    
    if existing_months:
        prev_month_date = existing_months[0]
        prev_entries = MonthlyEntry.objects.filter(date__year=prev_month_date.year, date__month=prev_month_date.month)
        
        # Copy entries to target month
        for entry in prev_entries:
            MonthlyEntry.objects.create(
                date=target_date,
                bank_name=entry.bank_name,
                account_name=entry.account_name,
                account_type=entry.account_type,
                amount=entry.amount,  # Keep same amount
                notes=""
            )
    else:
        # No previous months exist, create default template
        create_default_template(target_date)

def create_default_template(month_date):
    """Create template accounts for the specified month"""
    accounts = [
        {'bank': 'Barclays', 'account': 'Main Account', 'type': 'Current', 'amount': 0},
        {'bank': 'Barclays', 'account': 'Joint Account', 'type': 'Current', 'amount': 0},
        {'bank': 'Barclays', 'account': 'Rainy Day', 'type': 'Savings', 'amount': 0},
        {'bank': 'Barclays', 'account': 'ISA', 'type': 'Savings', 'amount': 0},
        {'bank': 'HSBC', 'account': 'Flex Account', 'type': 'Current', 'amount': 0},
        {'bank': 'Lloyds', 'account': 'Easy Saver', 'type': 'Savings', 'amount': 0},
        {'bank': 'Lloyds', 'account': 'Credit Card', 'type': 'Current', 'amount': 0},
        {'bank': 'Family', 'account': 'Personal Loan', 'type': 'Lending', 'amount': 0},  # Add example lending account
    ]
    
    for account in accounts:
        MonthlyEntry.objects.create(
            date=month_date,
            bank_name=account['bank'],
            account_name=account['account'],
            account_type=account['type'],
            amount=account['amount'],
            notes=""
        )

@csrf_exempt
def update_amount(request, entry_id):
    """AJAX endpoint to update an entry amount"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            entry = get_object_or_404(MonthlyEntry, id=entry_id)
            entry.amount = Decimal(data.get('amount', 0))
            entry.save()
            
            # Determine which group this entry belongs to
            month_entries = MonthlyEntry.objects.filter(
                date__year=entry.date.year,
                date__month=entry.date.month
            )
            
            current_total = sum(e.amount for e in month_entries.filter(account_type='Current'))
            savings_total = sum(e.amount for e in month_entries.filter(account_type='Savings'))
            lending_total = sum(e.amount for e in month_entries.filter(account_type='Lending'))
            grand_total = current_total + savings_total + lending_total
            
            return JsonResponse({
                'success': True, 
                'id': entry.id,
                'amount': float(entry.amount),
                'current_total': float(current_total),
                'savings_total': float(savings_total),
                'lending_total': float(lending_total),
                'grand_total': float(grand_total)
            })
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Invalid request'})

def add_account(request):
    """Add a new account to all months"""
    if request.method == 'POST':
        bank_name = request.POST.get('bank_name')
        account_name = request.POST.get('account_name')
        account_type = request.POST.get('account_type')
        
        if bank_name and account_name and account_type:
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
    
    return redirect('entry_form')

def entry_form(request):
    # Generate data for all months of 2025
    generate_year_data()
    
    # Group entries by month for all data
    entries_by_month = {}
    entries = MonthlyEntry.objects.all()
    
    # Current month and year
    today = date.today()
    current_year = 2025  # Focus on 2025
    current_month = today.month
    
    # Group entries for all months
    for entry in entries:
        month_key = f"{calendar.month_name[entry.date.month]} {entry.date.year}"
        month_date = entry.date.replace(day=1)
        
        if month_key not in entries_by_month:
            entries_by_month[month_key] = {
                'current': [], 
                'savings': [], 
                'lending': [],  # Add lending list
                'month_date': month_date
            }
        
        if entry.account_type == 'Current':
            entries_by_month[month_key]['current'].append(entry)
        elif entry.account_type == 'Savings':
            entries_by_month[month_key]['savings'].append(entry)
        elif entry.account_type == 'Lending':
            entries_by_month[month_key]['lending'].append(entry)
    
    # Filter and prepare data for 2025 months to show in horizontal scroller
    current_year_months = []
    for month in range(1, 13):
        month_date = date(current_year, month, 1)
        month_key = f"{calendar.month_name[month]} {current_year}"
        
        if month_key in entries_by_month:
            month_data = entries_by_month[month_key]
            
            # Mark if this is the current month
            is_current_month = (month == current_month and current_year == today.year)
            
            # Create a copy with the current month flag
            month_data_copy = month_data.copy()
            month_data_copy['is_current'] = is_current_month
            
            current_year_months.append((month_key, month_data_copy))
    
    # Ensure all months are in chronological order (January to December)
    current_year_months.sort(key=lambda x: x[1]['month_date'].month)
    
    # Also get the complete list of all data (for chart and hidden data)
    sorted_months = sorted(entries_by_month.items(), 
                        key=lambda x: x[1]['month_date'], 
                        reverse=True)
    
    return render(request, 'tracker/entry_form.html', {
        'entries_by_month': sorted_months,
        'current_year_months': current_year_months,
    })