from django.contrib import admin
from .models import StudentSchedule

@admin.register(StudentSchedule)
class StudentScheduleAdmin(admin.ModelAdmin):
    list_display = ('student', 'get_weekday_display', 'get_hour_display')
    list_filter = ('weekday', 'hour')
    search_fields = ('student__name',)
    ordering = ('student__name', 'weekday', 'hour')
