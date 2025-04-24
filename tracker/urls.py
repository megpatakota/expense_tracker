from django.urls import path
from .views import entry_form

urlpatterns = [
    path('', entry_form, name='entry_form'),
]
