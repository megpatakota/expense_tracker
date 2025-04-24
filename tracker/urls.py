from django.urls import path
from . import views

urlpatterns = [
    path('', views.entry_form, name='entry_form'),
    path('update-amount/<int:entry_id>/', views.update_amount, name='update_amount'),
    path('add-account/', views.add_account, name='add_account'),
    path('reset/', views.reset_data, name='reset_data'),
]