from rest_framework import serializers
from .models import StudentSchedule

class StudentScheduleSerializer(serializers.ModelSerializer):
    weekday_display = serializers.CharField(source='get_weekday_display', read_only=True)
    hour_display = serializers.CharField(source='get_hour_display', read_only=True)
    
    class Meta:
        model = StudentSchedule
        fields = ['id', 'student', 'weekday', 'weekday_display', 'hour', 'hour_display']
        read_only_fields = ['id']
