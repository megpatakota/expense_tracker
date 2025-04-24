from django.urls import path
from .views import entry_form, update_amount, add_account

urlpatterns = [
    path('', entry_form, name='entry_form'),
    path('update-amount/<int:entry_id>/', update_amount, name='update_amount'),
    path('add-account/', add_account, name='add_account'),
]