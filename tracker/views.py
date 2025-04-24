# Create your views here.
from django.shortcuts import render, redirect
from .models import MonthlyEntry
from django import forms

class MonthlyEntryForm(forms.ModelForm):
    class Meta:
        model = MonthlyEntry
        fields = ['date', 'account_name', 'account_type', 'amount', 'notes']

def entry_form(request):
    if request.method == 'POST':
        form = MonthlyEntryForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('entry_form')
    else:
        form = MonthlyEntryForm()
    entries = MonthlyEntry.objects.order_by('-date')
    return render(request, 'tracker/entry_form.html', {'form': form, 'entries': entries})
