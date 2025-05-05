from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['student', 'modality', 'amount', 'payment_date', 'reference_month']
    list_filter = ['payment_date', 'reference_month', 'modality']
    search_fields = ['student__name', 'modality__name']
    date_hierarchy = 'payment_date'
