from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from .models import MonthlyEntry
from django import forms
from datetime import date, timedelta
import calendar
from decimal import Decimal
from django.views.decorators.csrf import csrf_exempt
import json
from django.core.serializers.json import DjangoJSONEncoder

def generate_monthly_template():
    """Generate template accounts for the current month if no data exists"""
    current_date = date.today().replace(day=1)  # First day of current month
    
    # Check if data exists for this month
    if MonthlyEntry.objects.filter(date__year=current_date.year, date__month=current_date.month).exists():
        return
    
    # Either copy from previous month or create template
    prev_month = (current_date - timedelta(days=1)).replace(day=1)
    prev_entries = MonthlyEntry.objects.filter(date__year=prev_month.year, date__month=prev_month.month)
    
    if prev_entries.exists():
        # Copy entries from previous month
        for entry in prev_entries:
            MonthlyEntry.objects.create(
                date=current_date,
                bank_name=entry.bank_name,
                account_name=entry.account_name,
                account_type=entry.account_type,
                amount=entry.amount,
                notes=""
            )
    else:
        # Create template accounts
        accounts = [
            {'bank': 'Barclays', 'account': 'Main Account', 'type': 'Current', 'amount': 0},
            {'bank': 'Barclays', 'account': 'Joint Account', 'type': 'Current', 'amount': 0},
            {'bank': 'Barclays', 'account': 'Rainy Day', 'type': 'Savings', 'amount': 0},
            {'bank': 'Barclays', 'account': 'ISA', 'type': 'Savings', 'amount': 0},
            {'bank': 'HSBC', 'account': 'Flex Account', 'type': 'Current', 'amount': 0},
            {'bank': 'Lloyds', 'account': 'Easy Saver', 'type': 'Savings', 'amount': 0},
            {'bank': 'Lloyds', 'account': 'Credit Card', 'type': 'Current', 'amount': 0},
        ]
        
        for account in accounts:
            MonthlyEntry.objects.create(
                date=current_date,
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
            grand_total = current_total + savings_total
            
            return JsonResponse({
                'success': True, 
                'id': entry.id,
                'amount': float(entry.amount),
                'current_total': float(current_total),
                'savings_total': float(savings_total),
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
    # Generate template for current month if needed
    generate_monthly_template()
    
    # Group entries by month
    entries_by_month = {}
    entries = MonthlyEntry.objects.all()
    
    for entry in entries:
        month_key = f"{calendar.month_name[entry.date.month]} {entry.date.year}"
        month_date = entry.date.replace(day=1)
        
        if month_key not in entries_by_month:
            entries_by_month[month_key] = {'current': [], 'savings': [], 'month_date': month_date}
        
        if entry.account_type == 'Current':
            entries_by_month[month_key]['current'].append(entry)
        else:
            entries_by_month[month_key]['savings'].append(entry)
    
    # Sort months in reverse chronological order
    sorted_months = sorted(entries_by_month.items(), 
                         key=lambda x: x[1]['month_date'], 
                         reverse=True)
    
    return render(request, 'tracker/entry_form.html', {
        'entries_by_month': sorted_months
    })