from django.db import models
from student.models import Student
from modality.models import Modality
from physiotherapist.models import Physiotherapist

class Payment(models.Model):
    student = models.ForeignKey(
        Student,
        on_delete=models.PROTECT,
        related_name='payments',
        verbose_name='Aluno'
    )
    modality = models.ForeignKey(
        Modality,
        on_delete=models.PROTECT,
        related_name='payments',
        verbose_name='Modalidade'
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Valor Pago'
    )
    payment_date = models.DateField(
        verbose_name='Data do Pagamento'
    )
    reference_month = models.DateField(
        verbose_name='Mês de Referência',
        null=True,
        blank=True,
        help_text='Mês de referência para pagamentos mensais'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.student.name} - {self.payment_date}'

    class Meta:
        verbose_name = 'Pagamento'
        verbose_name_plural = 'Pagamentos'
        ordering = ['-payment_date']

class ClinicCommissionPayment(models.Model):
    STATUS_CHOICES = [
        ('awaiting_approval', 'Aguardando Aprovação'),
        ('approved', 'Aprovado'),
    ]
    
    physiotherapist = models.ForeignKey(
        Physiotherapist,
        on_delete=models.PROTECT,
        related_name='commission_payments',
        verbose_name='Fisioterapeuta'
    )
    payments = models.ManyToManyField(
        'Payment',
        related_name='commission_payments',
        verbose_name='Pagamentos Incluídos'
    )
    transfer_date = models.DateField(
        verbose_name='Data da Transferência'
    )
    total_commission_due = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Total de Comissão Devido'
    )
    amount_paid = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Valor Transferido'
    )    
    description = models.TextField(
        verbose_name='Descrição',
        help_text='Descrição sobre a transferência realizada'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='awaiting_approval',
        verbose_name='Status'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Comissão - {self.physiotherapist.user.get_full_name()} - {self.transfer_date}'

    class Meta:
        verbose_name = 'Pagamento de Comissão'
        verbose_name_plural = 'Pagamentos de Comissões'
        ordering = ['-transfer_date']
