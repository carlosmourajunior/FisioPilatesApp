from django.contrib import admin
from .models import Student

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'active', 'registration_date')
    list_filter = ('active', 'registration_date')
    search_fields = ('name', 'email', 'phone')
    ordering = ('name',)
