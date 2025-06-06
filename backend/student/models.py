from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from physiotherapist.models import Physiotherapist
from modality.models import Modality

class Student(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    registration_date = models.DateTimeField(auto_now_add=True)
    active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, null=True)
    
    PAYMENT_TYPE_CHOICES = [
        ('PRE', 'Pré-pago'),
        ('POS', 'Pós-pago'),
    ]    
    payment_type = models.CharField(
        max_length=3,
        choices=PAYMENT_TYPE_CHOICES,
        default='PRE',
        verbose_name='Tipo de Pagamento'
    )
    payment_day = models.PositiveIntegerField(
        blank=True, 
        null=True,
        verbose_name='Dia do Pagamento',
        help_text='Dia do mês para pagamento (1-31)',
        validators=[
            MinValueValidator(1),
            MaxValueValidator(31)
        ]
    )
    session_quantity = models.PositiveIntegerField(
        blank=True,
        null=True,
        verbose_name='Quantidade de Sessões',
        help_text='Quantidade de sessões disponíveis para pagamento por sessão'
    )
    physiotherapist = models.ForeignKey(
        Physiotherapist,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students'
    )    
    
    modality = models.ForeignKey(
        Modality,
        on_delete=models.PROTECT,
        related_name='students',
        verbose_name='Modalidade',
        null=True,
    )
    
    commission = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=50.00,
        verbose_name='Comissão (%)',
        help_text='Porcentagem de comissão (entre 0 e 100)',
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100)
        ]
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']    
        def __str__(self):
            return self.name

    class Meta:
        ordering = ['name']
