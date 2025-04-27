from django.contrib import admin
from .models import Modality

@admin.register(Modality)
class ModalityAdmin(admin.ModelAdmin):
    list_display = ('name', 'price')
    search_fields = ('name',)
