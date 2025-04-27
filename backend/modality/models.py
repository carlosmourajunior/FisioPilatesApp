from django.db import models

class Modality(models.Model):
    PAYMENT_TYPE_CHOICES = [
        ('MONTHLY', 'Mensal'),
        ('SESSION', 'Sessão'),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    payment_type = models.CharField(
        max_length=10,
        choices=PAYMENT_TYPE_CHOICES,
        default='MONTHLY',
        verbose_name='Tipo de Pagamento'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Modalidade'
        verbose_name_plural = 'Modalidades'
        ordering = ['name']
