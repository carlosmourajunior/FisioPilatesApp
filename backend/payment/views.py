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
        from django.db.models import Count        # Get current date and calculate months
        current_date = datetime.now().date()
        current_year = current_date.year
        current_month = current_date.month
          # Initialize months list
        months = []
        
        # Add previous months first (from oldest to newest)
        for i in range(3, 0, -1):  # 3 meses anteriores
            month = current_month - i
            year = current_year
            
            if month <= 0:
                month = 12 + month  # month é negativo, então somamos a 12
                year -= 1
                
            months.append({
                'year': year,
                'month': month,
                'is_current': False,
                'is_future': False
            })
        
        # Add current month
        months.append({
            'year': current_year,
            'month': current_month,
            'is_current': True,
            'is_future': False
        })
        
        # Add next month for preview
        next_month = current_month + 1 if current_month < 12 else 1
        next_year = current_year if current_month < 12 else current_year + 1
        
        months.append({
            'year': next_year,
            'month': next_month,
            'is_current': False,
            'is_future': True
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
                ).distinct()                # Calcula comissão do mês atual para esta fisioterapeuta
                physio_payments_month = Payment.objects.filter(
                    student__physiotherapist=physio,
                    reference_month__year=current_year,
                    reference_month__month=current_month
                )                # Calcula o total recebido e comissão por aluno
                total_month_payments = 0
                commission_to_pay = 0
                for payment in physio_payments_month:
                    total_month_payments += payment.amount
                    commission_to_pay += payment.amount * (payment.student.commission / 100)

                physio_summary = {
                    'id': physio.id,
                    'name': physio.user.get_full_name() or physio.user.username,
                    'total_students': physio_students.count(),
                    'paid_students': paid_students.count(),
                    'pending_students': physio_students.count() - paid_students.count(),
                    'total_month_revenue': total_month_payments,
                    'commission_to_pay': commission_to_pay
                }
                physiotherapist_summary.append(physio_summary)

        # Get total active students
        students = Student.objects.filter(active=True)
        
        # Filter by physiotherapist if not admin
        if not self.request.user.is_staff:
            students = students.filter(physiotherapist=self.request.user.physiotherapist)

        total_students = students.count()        # Inicializa variáveis
        monthly_summary = []
        total_overdue = 0  # Total atrasado
        total_commissions = 0  # Total de comissões
        total_expected_commissions = 0  # Total de comissões esperadas
        
        for month_data in months:
            year = month_data['year']
            month = month_data['month']              # Primeiro pega todos os alunos ativos com modalidade
            students_for_month = students.filter(Q(modality__isnull=False))
            
            # Se não for mês futuro, filtra por data de cadastro
            if not month_data.get('is_future', False):
                target_date = date(year, month, 1)
                next_month = target_date.replace(day=28) + timedelta(days=4)  # Pulamos para o próximo mês
                next_month = next_month.replace(day=1)  # Primeiro dia do próximo mês
                
                students_for_month = students_for_month.filter(
                    registration_date__date__lt=next_month  # Alunos cadastrados antes do próximo mês
                )
                
                # Busca pagamentos do mês
                paid_students = students_for_month.filter(
                    payments__reference_month__year=year,
                    payments__reference_month__month=month
                ).distinct()
            else:
                # Para mês futuro, não tem pagamentos
                paid_students = students.none()
            
            # Get payments for this month
            monthly_payments = Payment.objects.filter(
                student__in=students_for_month,
                reference_month__year=year,
                reference_month__month=month
            )
            
            total_received = sum(payment.amount for payment in monthly_payments)
            
            # Calculate expected value based on modalities (only for registered students)
            total_expected = sum(student.modality.price for student in students_for_month if student.modality)
            total_pending = total_expected - total_received
            
            # Per physiotherapist breakdown if admin
            physiotherapist_breakdown = []
            if self.request.user.is_staff:
                from physiotherapist.models import Physiotherapist
                for physio in Physiotherapist.objects.all():
                    physio_students = students_for_month.filter(physiotherapist=physio)
                    physio_paid = paid_students.filter(physiotherapist=physio)
                    physio_payments = monthly_payments.filter(student__physiotherapist=physio)
                    
                    physiotherapist_breakdown.append({
                        'id': physio.id,
                        'name': physio.user.get_full_name() or physio.user.username,
                        'total_students': physio_students.count(),
                        'paid_students': physio_paid.count(),
                        'pending_students': physio_students.count() - physio_paid.count(),
                        'total_received': sum(payment.amount for payment in physio_payments),
                    })            # Adiciona ao resumo mensal
            month_summary = {
                'year': year,
                'month': month,
                'is_current': month_data.get('is_current', False),
                'is_future': month_data.get('is_future', False),
                'total_students': students_for_month.count(),
                'paid_students': paid_students.count(),
                'pending_students': students_for_month.count() - paid_students.count(),
                'total_received': total_received,
                'total_expected': total_expected,
                'total_pending': total_pending,
                'physiotherapist_breakdown': physiotherapist_breakdown if self.request.user.is_staff else []
            }
              # Se é mês futuro, calcula apenas o valor esperado
            if month_data.get('is_future', False):
                month_summary['total_expected'] = total_expected
                month_summary['is_future'] = True
                month_summary['total_students'] = students_for_month.count()
                month_summary['total_received'] = 0
                month_summary['total_pending'] = total_expected
                month_summary['paid_students'] = 0
                month_summary['pending_students'] = students_for_month.count()

            # Verifica se tem valores ou se é mês atual/futuro antes de adicionar
            has_values = (
                month_summary['total_expected'] > 0 or 
                month_summary['total_received'] > 0 or 
                month_data.get('is_current', False) or 
                month_data.get('is_future', False)
            )
            
            if has_values:
                monthly_summary.append(month_summary)

            # Se for mês passado e tiver pendências, adiciona ao total atrasado
            if not month_data.get('is_current', False) and not month_data.get('is_future', False):
                if total_expected > 0:  # Só adiciona se houver valor esperado
                    total_overdue += total_pending# Encontra o mês atual no array
        current_month_data = next(
            (month for month in monthly_summary if month.get('is_current', False)),
            {
                'total_received': 0,
                'total_expected': 0,
                'total_pending': 0
            }        )          # Filtra os estudantes baseado no usuário
        if self.request.user.is_staff:
            active_students = students.filter(active=True, modality__isnull=False)
        else:
            active_students = students.filter(
                active=True, 
                modality__isnull=False,
                physiotherapist=self.request.user.physiotherapist
            )

        # Pega os pagamentos do mês atual
        current_month_payments = Payment.objects.filter(
            student__in=active_students,
            reference_month__year=current_date.year,
            reference_month__month=current_date.month
        )

        # Calcula comissões dos pagamentos já recebidos
        total_commissions = 0
        for payment in current_month_payments:
            if payment.student.commission is not None:
                total_commissions += float(payment.amount) * (float(payment.student.commission) / 100)

        # Calcula comissões esperadas apenas dos pagamentos pendentes
        total_expected_commissions = 0
        pending_students = active_students.exclude(
            id__in=current_month_payments.values_list('student_id', flat=True)
        )
        
        for student in pending_students:
            if student.commission is not None and student.modality is not None:
                total_expected_commissions += float(student.modality.price) * (float(student.commission) / 100)

        response_data = {
            'total_students': total_students,
            'monthly_summary': monthly_summary,
            'current_month_summary': {
                'total_received': current_month_data['total_received'],
                'total_expected': current_month_data['total_expected'],
                'total_pending': current_month_data['total_pending'],
                'total_overdue': total_overdue,
                'total_commissions': total_commissions,
                'total_expected_commissions': total_expected_commissions
            }
        }        # Inclui o resumo do fisioterapeuta na resposta
        if self.request.user.is_staff:
            # Para admin, inclui todos os fisioterapeutas
            response_data['physiotherapist_summary'] = physiotherapist_summary
        else:
            # Para fisioterapeuta, inclui apenas seus próprios dados
            response_data['physiotherapist_summary'] = [
                physio for physio in physiotherapist_summary 
                if physio['id'] == self.request.user.physiotherapist.id
            ]

        return Response(response_data)

    @action(detail=False, methods=['get'])
    def student_payment_status(self, request):
        student_id = request.query_params.get('student')
        if not student_id:
            raise ValidationError({'student': 'O ID do aluno é obrigatório'})

        try:
            student = Student.objects.get(pk=student_id)
        except Student.DoesNotExist:
            raise ValidationError({'student': 'Aluno não encontrado'})

        # Se não é admin, verifica se o aluno pertence ao fisioterapeuta
        if not request.user.is_staff:
            if student.physiotherapist != request.user.physiotherapist:
                raise ValidationError({'student': 'Acesso não autorizado a este aluno'})

        # Pega o tipo de pagamento da modalidade do aluno
        if not student.modality:
            return Response({
                'payment_type': None,
                'paid_current_month': False
            })

        if student.modality.payment_type == 'MONTHLY':
            today = datetime.now()
            current_year = today.year
            current_month = today.month
            
            # Determina o mês de referência baseado no tipo de pagamento do aluno
            if student.payment_type == 'PRE':
                ref_year = current_year
                ref_month = current_month
            else:  # POS
                # Para pós-pago, verifica o mês anterior
                if current_month == 1:
                    ref_year = current_year - 1
                    ref_month = 12
                else:
                    ref_year = current_year
                    ref_month = current_month - 1

            # Verifica se existe pagamento para o mês de referência
            paid_current_month = Payment.objects.filter(
                student=student,
                reference_month__year=ref_year,
                reference_month__month=ref_month
            ).exists()

            return Response({
                'payment_type': 'MONTHLY',
                'paid_current_month': paid_current_month,
                'modality_price': float(student.modality.price)
            })
        else:  # SESSION
            total_sessions = student.session_quantity or 0
            total_value = total_sessions * student.modality.price if total_sessions else 0
            
            total_paid = sum(
                payment.amount for payment in Payment.objects.filter(student=student)
            )
            
            return Response({
                'payment_type': 'SESSION',
                'session_price': float(student.modality.price),
                'session_quantity': total_sessions,
                'total_value': float(total_value),
                'total_paid': float(total_paid),
                'remaining_value': float(total_value - total_paid) if total_value else 0
            })
