from rest_framework import serializers
from .models import Student
from physiotherapist.models import Physiotherapist
from physiotherapist.serializers import PhysiotherapistSerializer
from modality.serializers import ModalitySerializer

class StudentSerializer(serializers.ModelSerializer):
    physiotherapist_details = PhysiotherapistSerializer(source='physiotherapist', read_only=True)
    modality_details = ModalitySerializer(source='modality', read_only=True)
    schedules = serializers.SerializerMethodField()
    
    class Meta:
        model = Student        
        fields = ['id', 'name', 'email', 'phone', 'date_of_birth', 'registration_date', 
                 'active', 'notes', 'physiotherapist', 'physiotherapist_details',
                 'modality', 'modality_details', 'schedules', 'payment_date', 'session_quantity',
                 'payment_type']
        read_only_fields = ['registration_date']
        
    def get_schedules(self, obj):
        from schedule.serializers import StudentScheduleSerializer
        return StudentScheduleSerializer(obj.schedules.all(), many=True).data
