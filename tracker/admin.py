from django.contrib import admin
from .models import MonthlyEntry

@admin.register(MonthlyEntry)
class MonthlyEntryAdmin(admin.ModelAdmin):
    list_display = ('date', 'bank_name', 'account_name', 'account_type', 'amount')
    list_filter = ('account_type', 'bank_name', 'date')
    search_fields = ('bank_name', 'account_name', 'notes')

# Register your models here.
