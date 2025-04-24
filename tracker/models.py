from django.db import models

class MonthlyEntry(models.Model):
    date = models.DateField(unique=True)
    account_name = models.CharField(max_length=100)
    account_type = models.CharField(max_length=50, choices=[
        ('Current', 'Current'),
        ('Savings', 'Savings'),
        ('Credit Card', 'Credit Card'),
        ('Loan', 'Loan'),
        ('Pension', 'Pension'),
        ('Expense', 'Expense'),
        ('Income', 'Income'),
        ('Tax', 'Tax')
    ])
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.account_name} - {self.date} ({self.amount})"
