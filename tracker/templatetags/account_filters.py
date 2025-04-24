from django import template
from decimal import Decimal

register = template.Library()

@register.filter
def sum_amounts(entries):
    """Calculate the sum of amounts for a list of entries"""
    if not entries:
        return Decimal('0.00')
    
    total = Decimal('0.00')
    for entry in entries:
        if hasattr(entry, 'amount'):
            total += entry.amount
    return total

@register.filter
def add(value1, value2):
    """Add two decimal values together"""
    try:
        return value1 + value2
    except (TypeError, ValueError):
        return Decimal('0.00')