from django.db import models
from django.contrib.auth.models import User

class Physiotherapist(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='physiotherapist')
    crefito = models.CharField(max_length=20, unique=True)
    phone = models.CharField(max_length=20)
    specialization = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name()} - CREFITO: {self.crefito}"

    class Meta:
        verbose_name = 'Fisioterapeuta'
        verbose_name_plural = 'Fisioterapeutas'
