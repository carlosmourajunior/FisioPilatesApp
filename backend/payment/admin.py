from django.contrib import admin
from .models import Payment, ClinicCommissionPayment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['student', 'modality', 'amount', 'payment_date', 'reference_month']
    list_filter = ['payment_date', 'reference_month', 'modality']
    search_fields = ['student__name', 'modality__name']
    date_hierarchy = 'payment_date'

@admin.register(ClinicCommissionPayment)
class ClinicCommissionPaymentAdmin(admin.ModelAdmin):
    list_display = [
        'get_physiotherapist_name', 
        'transfer_date', 
        'total_commission_due', 
        'amount_paid', 
        'status',
        'created_at'
    ]
    list_filter = [
        'status', 
        'transfer_date', 
        'physiotherapist',
        'created_at'
    ]
    search_fields = [
        'physiotherapist__user__first_name',
        'physiotherapist__user__last_name', 
        'description'
    ]
    date_hierarchy = 'transfer_date'
    readonly_fields = ['created_at']
    filter_horizontal = ['payments']
    list_editable = ['status']  # Permite editar status diretamente na lista
    list_per_page = 25
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('physiotherapist', 'transfer_date', 'status')
        }),
        ('Valores', {
            'fields': ('total_commission_due', 'amount_paid')
        }),
        ('Descrição', {
            'fields': ('description',)
        }),
        ('Pagamentos Relacionados', {
            'fields': ('payments',)
        }),
        ('Metadados', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Otimiza as consultas incluindo os relacionamentos"""
        queryset = super().get_queryset(request)
        return queryset.select_related('physiotherapist__user').prefetch_related('payments')
    
    def get_physiotherapist_name(self, obj):
        """Retorna o nome completo do fisioterapeuta"""
        return obj.physiotherapist.user.get_full_name() or obj.physiotherapist.user.username
    get_physiotherapist_name.short_description = 'Fisioterapeuta'
    get_physiotherapist_name.admin_order_field = 'physiotherapist__user__first_name'
    
    def save_model(self, request, obj, form, change):
        """Personaliza o salvamento do modelo no admin"""
        super().save_model(request, obj, form, change)
        
    actions = ['approve_payments', 'mark_as_awaiting_approval']
    
    def approve_payments(self, request, queryset):
        """Ação para aprovar pagamentos em lote"""
        updated = queryset.update(status='approved')
        self.message_user(request, f'{updated} pagamentos foram aprovados.')
    approve_payments.short_description = "Aprovar pagamentos selecionados"
    
    def mark_as_awaiting_approval(self, request, queryset):
        """Ação para marcar como aguardando aprovação"""
        updated = queryset.update(status='awaiting_approval')
        self.message_user(request, f'{updated} pagamentos foram marcados como aguardando aprovação.')
    mark_as_awaiting_approval.short_description = "Marcar como aguardando aprovação"
