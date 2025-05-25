from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Q
from datetime import date, datetime, timedelta
from decimal import Decimal
from rest_framework.exceptions import ValidationError
from .models import Payment, ClinicCommissionPayment
from .serializers import PaymentSerializer, ClinicCommissionPaymentSerializer
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
        month_year = request.query_params.get('month_year') or request.query_params.get('month')
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
        
        # Filtra por data de cadastro (apenas alunos cadastrados antes ou durante o mês de referência)
        next_month = target_date.replace(day=28) + timedelta(days=4)  # Pulamos para o próximo mês
        next_month = next_month.replace(day=1)  # Primeiro dia do próximo mês
        
        students = students.filter(registration_date__date__lt=next_month)
        
        # Filtra por fisioterapeuta
        if not request.user.is_staff:
            # Se não é admin, só mostra alunos do próprio fisioterapeuta
            students = students.filter(physiotherapist=request.user.physiotherapist)
        elif physiotherapist_id:
            # Se é admin e especificou um fisioterapeuta, filtra por ele
            students = students.filter(physiotherapist_id=physiotherapist_id)

        # Total de alunos com pagamento mensal
        total_students = students.filter(modality__payment_type='MONTHLY').count()        # Busca todos os alunos que pagaram no mês em uma única query
        paid_students = students.filter(
            Q(modality__payment_type='MONTHLY') &
            (
                # Alunos pré-pagos: verifica mês de referência
                (Q(payment_type='PRE') & 
                 Q(payments__reference_month__year=year) & 
                 Q(payments__reference_month__month=month)) |
                # Alunos pós-pagos: verifica data do pagamento
                (Q(payment_type='POS') & 
                 Q(payments__payment_date__year=year) & 
                 Q(payments__payment_date__month=month))
            )
        ).distinct()        # Busca todos os pagamentos do mês
        paid_payments = Payment.objects.filter(
            Q(student__in=students) &
            Q(student__modality__payment_type='MONTHLY') &
            (
                # Pagamentos pré-pagos: verifica mês de referência
                (Q(student__payment_type='PRE') & 
                 Q(reference_month__year=year) & 
                 Q(reference_month__month=month)) |
                # Pagamentos pós-pagos: verifica data do pagamento
                (Q(student__payment_type='POS') & 
                 Q(payment_date__year=year) & 
                 Q(payment_date__month=month))
            )
        )
        
        total_received = sum(payment.amount for payment in paid_payments)        # Lista de pendentes
        pending_students = students.filter(
            modality__payment_type='MONTHLY'
        ).exclude(
            id__in=paid_students.values_list('id', flat=True)
        )
        
        # Verificar pagamentos atrasados - apenas para o mês atual
        current_date = datetime.now()
        is_current_month = (current_date.year == year and current_date.month == month)
        
        # Para pagamentos atrasados, só considera:
        # 1. Mês atual
        # 2. Alunos que não pagaram no mês
        # 3. Alunos com dia de pagamento definido
        # 4. Dia atual é maior que o dia de pagamento
        overdue_students = []
        total_overdue = 0
        if is_current_month:
            overdue_students = pending_students.filter(
                payment_day__isnull=False,
                payment_day__lt=current_date.day
            )
            total_overdue = sum(student.modality.price for student in overdue_students)

        # Verificar pagamentos atrasados - apenas para o mês atual
        current_date = datetime.now()
        is_current_month = (current_date.year == year and current_date.month == month)
        
        # Para pagamentos atrasados, considera apenas alunos com dia de pagamento definido
        # e que o dia atual é maior que o dia de pagamento
        overdue_students = []
        total_overdue = 0
        if is_current_month:
            overdue_students = pending_students.filter(
                payment_day__isnull=False,
                payment_day__lt=current_date.day
            )
            total_overdue = sum(student.modality.price for student in overdue_students)
        
        # Calcular valor total esperado e pendente
        total_expected = sum(student.modality.price for student in students.filter(modality__payment_type='MONTHLY'))
        total_pending = total_expected - total_received

        return Response({            'totalStudents': total_students,
            'paidStudents': paid_students.count(),
            'pendingStudents': pending_students.count(),
            'overdueStudents': len(overdue_students) if is_current_month else 0,
            'totalExpectedValue': total_expected,
            'totalReceivedValue': total_received,
            'totalPendingValue': total_pending,
            'totalOverdueValue': total_overdue if is_current_month else 0,
            'paidList': [
                {
                    'id': student.id,
                    'name': student.name,
                    'modality_name': student.modality.name,
                    'modality': student.modality.id,
                    'payment_type': student.payment_type,
                    'payment_date': (
                        student.payments.filter(payment_date__year=year, payment_date__month=month).first().payment_date
                        if student.payment_type == 'POS'
                        else student.payments.filter(reference_month__year=year, reference_month__month=month).first().payment_date
                    ),
                    'reference_month': (
                        student.payments.filter(payment_date__year=year, payment_date__month=month).first().reference_month
                        if student.payment_type == 'POS'
                        else student.payments.filter(reference_month__year=year, reference_month__month=month).first().reference_month
                    ),
                    'amount': (
                        student.payments.filter(payment_date__year=year, payment_date__month=month).first().amount
                        if student.payment_type == 'POS'
                        else student.payments.filter(reference_month__year=year, reference_month__month=month).first().amount
                    ),
                    'schedules': [
                        {
                            'weekday': schedule.weekday,
                            'hour': schedule.hour
                        }
                        for schedule in student.schedules.all()
                    ]
                }
                for student in paid_students
            ],
            'pendingList': [
                {
                    'id': student.id,
                    'name': student.name,
                    'modality_name': student.modality.name,
                    'modality': student.modality.id,
                    'expected_amount': student.modality.price,                    'payment_type': student.payment_type,
                    'payment_day': student.payment_day,
                    'is_overdue': is_current_month and student.payment_day and current_date.day > student.payment_day,
                    'reference_month': (
                        # Se for pós-pago, usa o mês de referência (abril/2025) passado na query
                        target_date.strftime('%Y-%m')
                        if student.payment_type == 'POS'
                        # Se for pré-pago, usa o mês seguinte (maio/2025)
                        else date(year, month+1 if month < 12 else 1, 1).strftime('%Y-%m')
                    ),
                    'schedules': [
                        {
                            'weekday': schedule.weekday,
                            'hour': schedule.hour
                        }
                        for schedule in student.schedules.all()
                    ]
                }
                for student in pending_students
            ]
        })

    @action(detail=False, methods=['get'])
    def dashboard_summary(self, request):
        from datetime import datetime, timedelta
        from django.db.models.functions import TruncMonth
        from django.db.models import Count, Sum, Q
        
        # Get current date and calculate months
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
                # Get payments for current month baseado na data do pagamento
                physio_students = Student.objects.filter(physiotherapist=physio, active=True)
                paid_students = physio_students.filter(
                    payments__payment_date__year=current_year,
                    payments__payment_date__month=current_month
                ).distinct()

                # Calcula comissão do mês atual para esta fisioterapeuta
                physio_payments_month = Payment.objects.filter(
                    student__physiotherapist=physio,
                    payment_date__year=current_year,
                    payment_date__month=current_month
                )

                # Calcula o total recebido e comissão por aluno
                total_month_payments = 0
                commission_to_pay = 0
                for payment in physio_payments_month:
                    if payment.student.commission is not None:
                        total_month_payments += payment.amount
                        commission_to_pay += payment.amount * (payment.student.commission / 100)

                # Busca comissões já pagas para este fisioterapeuta no mês atual
                paid_commissions = ClinicCommissionPayment.objects.filter(
                    physiotherapist=physio,
                    transfer_date__year=current_year,
                    transfer_date__month=current_month,
                    status='approved'  # Apenas comissões aprovadas
                )
                total_paid_commission = sum(payment.amount_paid for payment in paid_commissions)

                # Subtrai o valor já pago do total a pagar
                commission_to_pay = max(commission_to_pay - total_paid_commission, 0)

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

        total_students = students.count()
        monthly_summary = []
        total_overdue = 0  # Total atrasado
        total_commissions = 0  # Total de comissões
        total_expected_commissions = 0  # Total de comissões esperadas
        
        for month_data in months:
            year = month_data['year']
            month = month_data['month']
            
            # Primeiro pega todos os alunos ativos com modalidade
            students_for_month = students.filter(Q(modality__isnull=False))
            
            # Se não for mês futuro, filtra por data de cadastro
            if not month_data.get('is_future', False):
                target_date = date(year, month, 1)
                next_month = target_date.replace(day=28) + timedelta(days=4)  # Pulamos para o próximo mês
                next_month = next_month.replace(day=1)  # Primeiro dia do próximo mês
                
                students_for_month = students_for_month.filter(
                    registration_date__date__lt=next_month  # Alunos cadastrados antes do próximo mês
                )
                  # Busca pagamentos do mês considerando tipo de pagamento
                # Para alunos pré-pagos, usa o mês de referência
                pre_paid = students_for_month.filter(
                    Q(payment_type='PRE') &
                    Q(payments__reference_month__year=year) &
                    Q(payments__reference_month__month=month)
                ).distinct()

                # Para alunos pós-pagos, usa a data do pagamento
                post_paid = students_for_month.filter(
                    Q(payment_type='POS') &
                    Q(payments__payment_date__year=year) &
                    Q(payments__payment_date__month=month)
                ).distinct()

                # Combina os alunos pagantes
                paid_students = (pre_paid | post_paid).distinct()
            else:
                # Para mês futuro, não tem pagamentos
                paid_students = students.none()
            
            # Get payments for this month considerando tipo de pagamento
            monthly_payments = Payment.objects.filter(
                Q(student__in=students_for_month) &
                (
                    # Pagamentos pré-pagos: usa mês de referência
                    (Q(student__payment_type='PRE') & Q(reference_month__year=year) & Q(reference_month__month=month)) |
                    # Pagamentos pós-pagos: usa data do pagamento
                    (Q(student__payment_type='POS') & Q(payment_date__year=year) & Q(payment_date__month=month))
                )
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
                    })
                    
            # Adiciona ao resumo mensal
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
                monthly_summary.append(month_summary)            # Calcula o total atrasado
            if month_data.get('is_current', False):
                current_day = current_date.day
                # Filtra alunos sem pagamento no mês atual e com dia de pagamento menor que o dia atual
                overdue_students = students_for_month.filter(
                    Q(modality__payment_type='MONTHLY') &
                    Q(payment_day__isnull=False) &
                    Q(payment_day__lt=current_day)
                ).exclude(
                    # Exclui quem já pagou no mês atual
                    Q(payments__reference_month__year=year, payments__reference_month__month=month) |
                    Q(payments__payment_date__year=year, payments__payment_date__month=month)
                )
                # Soma o valor atrasado
                total_month_overdue = sum(student.modality.price for student in overdue_students if student.modality)
                total_overdue = total_month_overdue
                month_summary['total_overdue'] = total_month_overdue
        
        # Encontra o mês atual no array
        current_month_data = next(
            (month for month in monthly_summary if month.get('is_current', False)),
            {
                'total_received': 0,
                'total_expected': 0,
                'total_pending': 0
            }
        )
        
        # Filtra os estudantes baseado no usuário
        if self.request.user.is_staff:
            active_students = students.filter(active=True, modality__isnull=False)
        else:
            active_students = students.filter(
                active=True, 
                modality__isnull=False,
                physiotherapist=self.request.user.physiotherapist
            )

        # Pega os pagamentos do mês atual - usando data do pagamento ao invés do mês de referência
        current_month_payments = Payment.objects.filter(
            student__in=active_students,
            payment_date__year=current_date.year,
            payment_date__month=current_date.month
        )

        # Calcula comissões dos pagamentos já recebidos
        total_commissions = Decimal('0')
        for payment in current_month_payments:
            if payment.student.commission is not None:
                total_commissions += payment.amount * (payment.student.commission / Decimal('100'))

        # Calcula comissões esperadas dos pagamentos pendentes
        # Para pagamentos pendentes, usamos o mês de referência pois são pagamentos futuros
        total_expected_commissions = Decimal('0')
        # Primeiro, vamos pegar os pagamentos já feitos este mês para qualquer mês de referência
        paid_this_month = Payment.objects.filter(
            payment_date__year=current_date.year,
            payment_date__month=current_date.month
        ).values_list('student_id', flat=True)
        
        # Agora vamos pegar os alunos que ainda não pagaram este mês
        pending_students = active_students.exclude(
            id__in=paid_this_month
        )
        
        for student in pending_students:
            if student.commission is not None and student.modality is not None:
                total_expected_commissions += student.modality.price * (student.commission / Decimal('100'))

        # Busca o total de comissões já pagas no mês atual
        total_paid_commissions = Decimal('0')
        if self.request.user.is_staff:
            # Se é admin, soma todas as comissões pagas
            paid_commissions = ClinicCommissionPayment.objects.filter(
                transfer_date__year=current_date.year,
                transfer_date__month=current_date.month,
                status='approved'  # Apenas comissões aprovadas
            )
        else:
            # Se não é admin, soma apenas as comissões do fisioterapeuta
            paid_commissions = ClinicCommissionPayment.objects.filter(
                transfer_date__year=current_date.year,
                transfer_date__month=current_date.month,
                status='approved',  # Apenas comissões aprovadas
                physiotherapist=self.request.user.physiotherapist
            )
        
        total_paid_commissions = sum(payment.amount_paid for payment in paid_commissions)

        response_data = {
            'total_students': total_students,
            'monthly_summary': monthly_summary,
            'current_month_summary': {
                'total_received': current_month_data['total_received'],
                'total_expected': current_month_data['total_expected'],
                'total_pending': current_month_data['total_pending'],
                'total_overdue': total_overdue,
                'total_commissions': float(total_commissions),
                'total_expected_commissions': float(total_expected_commissions),
                'total_paid_commissions': float(total_paid_commissions)
            }
        }
        
        # Inclui o resumo do fisioterapeuta na resposta
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

class ClinicCommissionPaymentViewSet(viewsets.ModelViewSet):
    serializer_class = ClinicCommissionPaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ClinicCommissionPayment.objects.all()
        physiotherapist_id = self.request.query_params.get('physiotherapist', None)
        status = self.request.query_params.get('status', None)
        
        if not self.request.user.is_staff:
            # Se não for admin, só pode ver seus próprios pagamentos
            queryset = queryset.filter(physiotherapist=self.request.user.physiotherapist)
        elif physiotherapist_id:
            # Se for admin e houver filtro por fisioterapeuta
            queryset = queryset.filter(physiotherapist_id=physiotherapist_id)
        
        if status:
            queryset = queryset.filter(status=status)
            
        return queryset.order_by('-transfer_date')

    def create(self, request, *args, **kwargs):
        # Verifica se é fisioterapeuta tentando criar pagamento para outro fisioterapeuta
        if not request.user.is_staff:
            physiotherapist_id = request.data.get('physiotherapist')
            if str(physiotherapist_id) != str(request.user.physiotherapist.id):
                return Response(
                    {"detail": "Não autorizado a criar pagamentos para outros fisioterapeutas."},
                    status=status.HTTP_403_FORBIDDEN
                )
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            # Se não for admin, só pode criar pagamento para si mesmo
            if serializer.validated_data.get('physiotherapist') != self.request.user.physiotherapist:
                raise ValidationError({"detail": "Não autorizado a criar pagamentos para outros fisioterapeutas."})
            serializer.save(physiotherapist=self.request.user.physiotherapist, status='awaiting_approval')
        else:
            serializer.save(status='awaiting_approval')

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Endpoint para aprovar um pagamento de comissão
        """
        if not request.user.is_staff:
            return Response(
                {"detail": "Apenas administradores podem aprovar pagamentos."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        payment = self.get_object()
        if payment.status == 'approved':
            return Response(
                {"detail": "Este pagamento já está aprovado."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment.status = 'approved'
        payment.save()
        
        serializer = self.get_serializer(payment)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def total_commission_due(self, request):
        """
        Calculate total commission due for the current month based on student payments
        """
        physiotherapist_id = request.query_params.get('physiotherapist')
        
        if self.request.user.is_staff and physiotherapist_id:
            from physiotherapist.models import Physiotherapist
            try:
                physiotherapist = Physiotherapist.objects.get(id=physiotherapist_id)
            except Physiotherapist.DoesNotExist:
                return Response(
                    {"error": "Physiotherapist not found"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        elif hasattr(request.user, 'physiotherapist'):
            physiotherapist = request.user.physiotherapist
        else:
            return Response(
                {"error": "Invalid user or physiotherapist not specified"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        current_month = datetime.now().replace(day=1)

        # Get all payments from students of this physiotherapist for the current month
        payments = Payment.objects.filter(
            student__physiotherapist=physiotherapist,
            payment_date__year=current_month.year,
            payment_date__month=current_month.month
        ).select_related('student')

        # Calculate total commissions
        total_commission = Decimal('0')
        payment_details = []

        for payment in payments:
            student = payment.student
            if student.commission is not None:
                commission_amount = payment.amount * (student.commission / Decimal('100'))
                total_commission += commission_amount
                payment_details.append({
                    'student_name': student.name,
                    'payment_date': payment.payment_date,
                    'payment_amount': payment.amount,
                    'commission_rate': student.commission,
                    'commission_amount': commission_amount
                })        # Get commission payments already made this month
        paid_commissions = ClinicCommissionPayment.objects.filter(
            physiotherapist=physiotherapist,
            transfer_date__year=current_month.year,
            transfer_date__month=current_month.month,
            status='approved'  # Somente considerar pagamentos aprovados
        )
        total_paid = Decimal('0')
        for payment in paid_commissions:
            total_paid += payment.amount_paid

        # Calculate remaining commission due
        remaining_commission = max(total_commission - total_paid, Decimal('0'))

        return Response({
            'total_commission_due': remaining_commission,
            'total_paid': total_paid,
            'total_commission': total_commission,
            'month': current_month.strftime('%Y-%m'),
            'details': payment_details
        })

    @action(detail=False, methods=['get'], url_path='due/(?P<pk>[^/.]+)')
    def get_commissions_due(self, request, pk=None):
        from datetime import datetime
        from django.db.models import Sum

        # Verifica se tem permissão para acessar as comissões do fisioterapeuta
        if not request.user.is_staff and str(request.user.physiotherapist.id) != pk:
            return Response(
                {"detail": "Não autorizado a ver comissões de outros fisioterapeutas."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        current_date = datetime.now()

        # Busca pagamentos do mês atual que ainda não foram incluídos em um pagamento de comissão
        payments = Payment.objects.filter(
            student__physiotherapist_id=pk,
            student__commission__gt=0,  # Use student's commission instead
            payment_date__year=current_date.year,
            payment_date__month=current_date.month
        ).exclude(
            id__in=ClinicCommissionPayment.objects.values_list('payments', flat=True)
        )

        # Calcula o total devido
        total_due = Decimal('0')
        details = []
        for payment in payments:
            commission_rate = payment.student.commission  # This is already a Decimal
            commission_amount = payment.amount * (commission_rate / Decimal('100'))
            total_due += commission_amount
            
            details.append({
                'student_name': payment.student.name,
                'payment_date': payment.payment_date,
                'payment_amount': payment.amount,
                'commission_rate': commission_rate,
                'commission_amount': commission_amount
            })

        return Response({
            'total_commission_due': total_due,
            'total_paid': 0,
            'total_commission': total_due,
            'month': current_date.strftime('%Y-%m'),
            'details': details
        })
