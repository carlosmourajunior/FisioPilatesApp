from django.contrib import admin
from .models import Physiotherapist

@admin.register(Physiotherapist)
class PhysiotherapistAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_full_name', 'crefito', 'phone', 'specialization')
    search_fields = ('user__first_name', 'user__last_name', 'crefito', 'phone')
    ordering = ('user__first_name', 'user__last_name')

    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Nome Completo'
