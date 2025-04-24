from django.db import models

class MonthlyEntry(models.Model):
    ACCOUNT_TYPE_CHOICES = [
        ('Current', 'Current'),
        ('Savings', 'Savings'),
        ('Lending', 'Lending'),
        ('Deposits', 'Deposits'),
        ('Pensions', 'Pensions'),
        ('Credit Cards', 'Credit Cards'),
    ]
    
    date = models.DateField()
    bank_name = models.CharField(max_length=100)
    account_name = models.CharField(max_length=100)
    account_type = models.CharField(max_length=50, choices=ACCOUNT_TYPE_CHOICES)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    notes = models.TextField(blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['date', 'bank_name', 'account_name']),
        ]
        ordering = ['-date', 'bank_name', 'account_name']

    def __str__(self):
        return f"{self.bank_name} - {self.account_name} ({self.date.strftime('%Y-%m')}): {self.amount}"