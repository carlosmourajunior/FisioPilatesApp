from django.db import models
from student.models import Student
from modality.models import Modality

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
