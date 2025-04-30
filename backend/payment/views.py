from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Q
from datetime import date, datetime
from rest_framework.exceptions import ValidationError
from .models import Payment
from .serializers import PaymentSerializer
from student.models import Student

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Payment.objects.all()

        if not self.request.user.is_staff:
            # Se o usuário é um fisioterapeuta, mostrar apenas os pagamentos de seus alunos
            try:
                physiotherapist = self.request.user.physiotherapist
                queryset = queryset.filter(student__physiotherapist=physiotherapist)
            except:
                queryset = Payment.objects.none()

        student_id = self.request.query_params.get('student', None)
        if student_id is not None:
            queryset = queryset.filter(student_id=student_id)

        return queryset.order_by('-payment_date', '-created_at')

    @action(detail=False, methods=['get'])
    def summary(self, request):
        month_year = request.query_params.get('month_year')
        physiotherapist_id = request.query_params.get('physiotherapist')
        
        if not month_year:
            raise ValidationError({'month_year': 'O mês/ano é obrigatório (formato: YYYY-MM)'})

        try:
            year, month = map(int, month_year.split('-'))
            target_date = date(year, month, 1)
        except (ValueError, TypeError):
            raise ValidationError({'month_year': 'Formato inválido. Use YYYY-MM'})

        # Filtra estudantes ativos
        students = Student.objects.filter(active=True)
        
        # Filtro por fisioterapeuta
        if not self.request.user.is_staff:
            # Se não é admin, só mostra alunos do próprio fisioterapeuta
            students = students.filter(physiotherapist=self.request.user.physiotherapist)
        elif physiotherapist_id:
            # Se é admin e especificou um fisioterapeuta, filtra por ele
            students = students.filter(physiotherapist_id=physiotherapist_id)

        # Total de alunos com pagamento mensal
        total_students = students.filter(modality__payment_type='MONTHLY').count()        # Lista de pagos com valores
        paid_students = students.filter(
            Q(payments__reference_month__year=year) & 
            Q(payments__reference_month__month=month) &
            Q(modality__payment_type='MONTHLY')
        ).distinct()

        paid_payments = Payment.objects.filter(
            student__in=paid_students,
            reference_month__year=year,
            reference_month__month=month
        )
        total_received = sum(payment.amount for payment in paid_payments)

        # Lista de pendentes
        pending_students = students.filter(
            modality__payment_type='MONTHLY'
        ).exclude(
            id__in=paid_students.values_list('id', flat=True)
        )
        
        # Calcular valor total esperado e pendente
        total_expected = sum(student.modality.price for student in students.filter(modality__payment_type='MONTHLY'))
        total_pending = total_expected - total_received

        return Response({
            'totalStudents': total_students,
            'paidStudents': paid_students.count(),
            'pendingStudents': pending_students.count(),
            'totalExpectedValue': total_expected,
            'totalReceivedValue': total_received,
            'totalPendingValue': total_pending,
            'paidList': [
                {
                    'id': student.id,
                    'name': student.name,
                    'modality_name': student.modality.name,                    'payment_date': student.payments.filter(
                        reference_month__year=year,
                        reference_month__month=month
                    ).first().payment_date,
                    'amount': student.payments.filter(
                        reference_month__year=year,
                        reference_month__month=month
                    ).first().amount
                }
                for student in paid_students
            ],
            'pendingList': [
                {
                    'id': student.id,
                    'name': student.name,
                    'modality_name': student.modality.name,
                    'expected_amount': student.modality.price
                }
                for student in pending_students
            ]
        })

    @action(detail=False, methods=['get'])
    def dashboard_summary(self, request):
        from datetime import datetime, timedelta
        from django.db.models.functions import TruncMonth
        from django.db.models import Count

        # Get current date and previous months
        current_date = datetime.now()
        months = []
        for i in range(4):  # Current month + 3 previous months
            month_date = current_date - timedelta(days=30*i)
            months.append({
                'year': month_date.year,
                'month': month_date.month
            })

        # Get physiotherapist summary if admin
        physiotherapist_summary = []
        if self.request.user.is_staff:
            from physiotherapist.models import Physiotherapist
            physiotherapists = Physiotherapist.objects.all()
            for physio in physiotherapists:
                physio_students = Student.objects.filter(physiotherapist=physio, active=True)
                current_year = current_date.year
                current_month = current_date.month
                
                # Get payments for current month
                paid_students = physio_students.filter(
                    Q(payments__reference_month__year=current_year) & 
                    Q(payments__reference_month__month=current_month)
                ).distinct()

                physio_summary = {
                    'id': physio.id,
                    'name': physio.user.get_full_name() or physio.user.username,
                    'total_students': physio_students.count(),
                    'paid_students': paid_students.count(),
                    'pending_students': physio_students.count() - paid_students.count()
                }
                physiotherapist_summary.append(physio_summary)

        # Get total active students
        students = Student.objects.filter(active=True)
        
        # Filter by physiotherapist if not admin
        if not self.request.user.is_staff:
            students = students.filter(physiotherapist=self.request.user.physiotherapist)

        total_students = students.count()

        # Get monthly summary for last 4 months
        monthly_summary = []
        
        for month_data in months:
            year = month_data['year']
            month = month_data['month']
            
            # Get paid students for this month
            paid_students = students.filter(
                Q(payments__reference_month__year=year) & 
                Q(payments__reference_month__month=month)
            ).distinct()
            
            # Get payments for this month
            monthly_payments = Payment.objects.filter(
                student__in=students,
                reference_month__year=year,
                reference_month__month=month
            )
            
            total_received = sum(payment.amount for payment in monthly_payments)
            
            # Calculate pending students
            pending_students = students.exclude(
                id__in=paid_students.values_list('id', flat=True)
            )
            
            # Calculate expected value based on modalities
            total_expected = sum(student.modality.price for student in students)
            
            # Per physiotherapist breakdown if admin
            physiotherapist_breakdown = []
            if self.request.user.is_staff:
                from physiotherapist.models import Physiotherapist
                for physio in Physiotherapist.objects.all():
                    physio_students = students.filter(physiotherapist=physio)
                    physio_paid = paid_students.filter(physiotherapist=physio)
                    physio_payments = monthly_payments.filter(student__physiotherapist=physio)
                    
                    physiotherapist_breakdown.append({
                        'id': physio.id,
                        'name': physio.user.get_full_name() or physio.user.username,
                        'total_students': physio_students.count(),
                        'paid_students': physio_paid.count(),
                        'pending_students': physio_students.count() - physio_paid.count(),
                        'total_received': sum(payment.amount for payment in physio_payments),
                    })
            
            monthly_summary.append({
                'year': year,
                'month': month,
                'total_students': students.count(),
                'paid_students': paid_students.count(),
                'pending_students': pending_students.count(),
                'total_received': total_received,
                'total_expected': total_expected,
                'total_pending': total_expected - total_received,
                'physiotherapist_breakdown': physiotherapist_breakdown if self.request.user.is_staff else []
            })

        response_data = {
            'total_students': total_students,
            'monthly_summary': monthly_summary,
        }

        if self.request.user.is_staff:
            response_data['physiotherapist_summary'] = physiotherapist_summary

        return Response(response_data)
