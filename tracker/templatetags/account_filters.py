from django import template
from decimal import Decimal

register = template.Library()

@register.filter
def subtract(value, arg):
    """Subtracts the arg from the value"""
    try:
        return value - arg
    except (ValueError, TypeError):
        return value

@register.filter
def sum_amounts(entries):
    """Sums the amounts from a list of entries"""
    try:
        return sum(entry.amount for entry in entries)
    except (ValueError, TypeError, AttributeError):
        return 0

@register.filter
def add(value1, value2):
    """Add two decimal values together"""
    try:
        return value1 + value2
    except (TypeError, ValueError):
        return Decimal('0.00')

@register.filter
def filter_by_type(entries, account_type):
    """Filter entries by account type"""
    try:
        return [entry for entry in entries if entry.account_type == account_type]
    except (TypeError, AttributeError):
        return []
    
@register.filter
def calculate_total_assets(month_data):
    current = sum(entry.amount for entry in month_data.get('current', []))
    savings = sum(entry.amount for entry in month_data.get('savings', []))
    lending = sum(entry.amount for entry in month_data.get('lending', []))
    deposits = sum(entry.amount for entry in month_data.get('deposits', []))
    pensions = sum(entry.amount for entry in month_data.get('pensions', []))
    credit_cards = sum(entry.amount for entry in month_data.get('credit_cards', []))
    
    return current + savings + lending + deposits + pensions - credit_cards