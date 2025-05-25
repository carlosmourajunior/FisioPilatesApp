from rest_framework import serializers
from .models import Payment, ClinicCommissionPayment
from student.serializers import StudentSerializer
from modality.serializers import ModalitySerializer
from physiotherapist.models import Physiotherapist

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

class PhysiotherapistDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Physiotherapist
        fields = ['id']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['user'] = {
            'first_name': instance.user.first_name,
            'last_name': instance.user.last_name
        }
        return ret

class ClinicCommissionPaymentSerializer(serializers.ModelSerializer):
    physiotherapist_details = PhysiotherapistDetailSerializer(source='physiotherapist', read_only=True)
    total_commission_due = serializers.FloatField()
    amount_paid = serializers.FloatField()

    class Meta:
        model = ClinicCommissionPayment
        fields = [
            'id',
            'physiotherapist',
            'physiotherapist_details', 
            'transfer_date',
            'total_commission_due',
            'amount_paid',
            'description',
            'status',
            'created_at'
        ]
        read_only_fields = ['created_at', 'status']
