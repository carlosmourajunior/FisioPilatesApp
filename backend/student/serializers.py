from rest_framework import serializers
from .models import Student
from physiotherapist.models import Physiotherapist
from physiotherapist.serializers import PhysiotherapistSerializer
from modality.serializers import ModalitySerializer

class StudentSerializer(serializers.ModelSerializer):
    physiotherapist_details = PhysiotherapistSerializer(source='physiotherapist', read_only=True)
    modality_details = ModalitySerializer(source='modality', read_only=True)
    
    class Meta:
        model = Student
        fields = ['id', 'name', 'email', 'phone', 'date_of_birth', 'registration_date', 
                 'active', 'notes', 'physiotherapist', 'physiotherapist_details',
                 'modality', 'modality_details']
        read_only_fields = ['registration_date']
