from rest_framework import serializers
from .models import Payment
from student.serializers import StudentSerializer
from modality.serializers import ModalitySerializer

class PaymentSerializer(serializers.ModelSerializer):
    student_details = StudentSerializer(source='student', read_only=True)
    modality_details = ModalitySerializer(source='modality', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'student', 'student_details', 'modality', 'modality_details',
            'amount', 'payment_date', 'reference_month', 'created_at'
        ]
        read_only_fields = ['created_at']
