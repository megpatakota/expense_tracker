from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from .models import MonthlyEntry
from datetime import date
import calendar
from decimal import Decimal
from django.views.decorators.csrf import csrf_exempt
import json

def generate_year_data():
    """Generate test data for all months of 2025 if they don't exist"""
    current_year = 2025  # We're focusing only on 2025
    
    # Check if data for January 2025 exists (as a test for any data)
    jan_date = date(current_year, 1, 1)
    if MonthlyEntry.objects.filter(date__year=current_year).exists():
        # Some data exists for this year, make sure all months are covered
        ensure_all_months_exist(current_year)
        return
    
    # Sample accounts structure - Fixed the 'base_amount' to 'amount' inconsistency
    base_accounts = [
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
    
    
    # Generate account data for each month of 2025
    for month in range(1, 13):
        month_date = date(current_year, month, 1)
        
        for account in base_accounts:
            entry = MonthlyEntry.objects.create(
                date=month_date,
                bank_name=account['bank'],
                account_name=account['account'],
                account_type=account['type'],
                amount=account['amount'],  # Use the predefined amount
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
            deposits_total = sum(e.amount for e in month_entries.filter(account_type='Deposits'))
            pensions_total = sum(e.amount for e in month_entries.filter(account_type='Pensions'))
            credit_cards_total = sum(e.amount for e in month_entries.filter(account_type='Credit Cards'))
            
            # Update grand total to include all account types
            grand_total = (current_total + savings_total + lending_total + 
                         deposits_total + pensions_total - credit_cards_total)  # Subtract credit cards as they are liabilities
            
            return JsonResponse({
                'success': True, 
                'id': entry.id,
                'amount': float(entry.amount),
                'current_total': float(current_total),
                'savings_total': float(savings_total),
                'lending_total': float(lending_total),
                'deposits_total': float(deposits_total),
                'pensions_total': float(pensions_total),
                'credit_cards_total': float(credit_cards_total),
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
    entries = MonthlyEntry.objects.all().order_by('date', 'bank_name', 'account_name')
    
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
                'lending': [],
                'deposits': [],
                'pensions': [],
                'credit_cards': [],
                'month_date': month_date
            }
        
        # Add entry to appropriate list based on account type
        account_type = entry.account_type.lower().replace(' ', '_')
        if account_type in entries_by_month[month_key]:
            # Only add entry to the list if it matches the account type
            entries_by_month[month_key][account_type].append(entry)
    
    # Filter and prepare data for 2025 months to show in horizontal scroller
    current_year_months = []
    for month in range(1, 13):
        month_date = date(current_year, month, 1)
        month_key = f"{calendar.month_name[month]} {current_year}"
        
        if month_key in entries_by_month:
            month_data = entries_by_month[month_key]
            
            # Mark if this is the current month
            is_current_month = (month == current_month)
            
            # Create a copy with the current month flag
            month_data_copy = month_data.copy()
            month_data_copy['is_current'] = is_current_month
            
            current_year_months.append((month_key, month_data_copy))
    
    # Sort months chronologically
    current_year_months.sort(key=lambda x: x[1]['month_date'].month)
    
    # Get the complete list of all data (for chart and hidden data)
    sorted_months = sorted(entries_by_month.items(), 
                         key=lambda x: x[1]['month_date'],
                         reverse=True)
    
    return render(request, 'tracker/entry_form.html', {
        'entries_by_month': sorted_months,
        'current_year_months': current_year_months,
    })

def reset_data(request):
    """Helper view to reset all data"""
    if request.method == 'POST':
        # Delete all existing entries
        MonthlyEntry.objects.all().delete()
        # Regenerate data
        generate_year_data()
        return redirect('entry_form')
    return render(request, 'tracker/reset_confirm.html')

# Add these new imports
from django.db.models import Q

# Add these new view functions to views.py

@csrf_exempt
def update_account(request, entry_id):
    """AJAX endpoint to update account details (bank name and account name)"""
    if request.method == 'POST':
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
            
            # Get other entries for the same account across all months
            if data.get('update_all_months', True):
                # Find all entries with the same bank and account name across all months
                similar_entries = MonthlyEntry.objects.filter(
                    bank_name=old_bank_name,
                    account_name=old_account_name
                ).exclude(id=entry_id)
                
                # Update all similar entries
                similar_entries.update(
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
    
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@csrf_exempt
def delete_account(request, entry_id):
    """AJAX endpoint to delete an account"""
    if request.method == 'POST':
        try:
            entry = get_object_or_404(MonthlyEntry, id=entry_id)
            
            # Store details for finding similar entries
            bank_name = entry.bank_name
            account_name = entry.account_name
            month_name = calendar.month_name[entry.date.month] + " " + str(entry.date.year)
            
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
                date__year=entry.date.year,
                date__month=entry.date.month
            )
            
            current_total = sum(e.amount for e in month_entries.filter(account_type='Current'))
            savings_total = sum(e.amount for e in month_entries.filter(account_type='Savings'))
            lending_total = sum(e.amount for e in month_entries.filter(account_type='Lending'))
            deposits_total = sum(e.amount for e in month_entries.filter(account_type='Deposits'))
            pensions_total = sum(e.amount for e in month_entries.filter(account_type='Pensions'))
            credit_cards_total = sum(e.amount for e in month_entries.filter(account_type='Credit Cards'))
            
            # Update grand total to include all account types
            grand_total = (current_total + savings_total + lending_total + 
                         deposits_total + pensions_total - credit_cards_total)
            
            return JsonResponse({
                'success': True,
                'month': month_name,
                'totals': {
                    'current_total': float(current_total),
                    'savings_total': float(savings_total),
                    'lending_total': float(lending_total),
                    'deposits_total': float(deposits_total),
                    'pensions_total': float(pensions_total),
                    'credit_cards_total': float(credit_cards_total),
                    'grand_total': float(grand_total)
                }
            })
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Invalid request'})