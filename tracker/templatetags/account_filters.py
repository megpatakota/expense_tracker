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
def calculate_total_assets(value):
    if not value:
        return "0.00"
    try:
        current = sum(float(entry.amount) for entry in value.get('current', []))
        savings = sum(float(entry.amount) for entry in value.get('savings', []))
        lending = sum(float(entry.amount) for entry in value.get('lending', []))
        deposits = sum(float(entry.amount) for entry in value.get('deposits', []))
        pensions = sum(float(entry.amount) for entry in value.get('pensions', []))
        credit_cards = sum(float(entry.amount) for entry in value.get('credit_cards', []))
        
        total = current + savings + lending + deposits + pensions - credit_cards
        return f"{total:.2f}"
    except (AttributeError, TypeError):
        return "0.00"