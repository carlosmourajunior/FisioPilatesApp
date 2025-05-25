from datetime import datetime
from rest_framework import serializers
from .models import Student
from physiotherapist.models import Physiotherapist
from physiotherapist.serializers import PhysiotherapistSerializer
from modality.serializers import ModalitySerializer
from payment.models import Payment

class StudentSerializer(serializers.ModelSerializer):
    physiotherapist_details = PhysiotherapistSerializer(source='physiotherapist', read_only=True)
    modality_details = ModalitySerializer(source='modality', read_only=True)
    schedules = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Student
        fields = ['id', 'name', 'email', 'phone', 'date_of_birth', 'registration_date', 
                 'active', 'notes', 'physiotherapist', 'physiotherapist_details',
                 'modality', 'modality_details', 'schedules', 'payment_day', 'session_quantity',
                 'payment_type', 'commission', 'payment_status']
        read_only_fields = ['registration_date']

    def get_payment_status(self, obj):
        # If no modality is set, return None
        if not obj.modality:
            return None

        if obj.modality.payment_type == 'MONTHLY':
            # Get current month and year
            today = datetime.now()
            current_year = today.year
            current_month = today.month
            current_day = today.day

            # Determine reference month based on payment type
            if obj.payment_type == 'PRE':
                ref_year = current_year
                ref_month = current_month
            else:  # POS
                if current_month == 1:
                    ref_year = current_year - 1
                    ref_month = 12
                else:
                    ref_year = current_year
                    ref_month = current_month - 1

            # Check if there's a payment for the reference month
            paid_current_month = Payment.objects.filter(
                student=obj,
                reference_month__year=ref_year,
                reference_month__month=ref_month
            ).exists()
            
            # Check if payment is overdue
            is_overdue = False
            if not paid_current_month and obj.payment_day:
                # Payment is overdue if we've passed the payment day for the month
                # and no payment has been registered
                is_overdue = current_day > obj.payment_day

            return {
                'payment_type': 'MONTHLY',
                'paid_current_month': paid_current_month,
                'modality_price': float(obj.modality.price),
                'is_overdue': is_overdue,
                'payment_day': obj.payment_day
            }
        else:  # SESSION
            total_sessions = obj.session_quantity or 0
            total_value = total_sessions * obj.modality.price if total_sessions else 0
            
            total_paid = sum(
                payment.amount for payment in Payment.objects.filter(student=obj)
            )
            
            return {
                'payment_type': 'SESSION',
                'session_price': float(obj.modality.price),
                'session_quantity': total_sessions,
                'total_value': float(total_value),
                'total_paid': float(total_paid),
                'remaining_value': float(total_value - total_paid) if total_value else 0
            }
        
    def get_schedules(self, obj):
        from schedule.serializers import StudentScheduleSerializer
        return StudentScheduleSerializer(obj.schedules.all(), many=True).data
