from django.db import models
from student.models import Student

class StudentSchedule(models.Model):
    WEEKDAY_CHOICES = [
        (0, 'Segunda-feira'),
        (1, 'Terça-feira'),
        (2, 'Quarta-feira'),
        (3, 'Quinta-feira'),
        (4, 'Sexta-feira'),
        (5, 'Sábado'),
        (6, 'Domingo'),
    ]
    
    HOUR_CHOICES = [(i, f'{i:02d}:00') for i in range(6, 22)]  # From 06:00 to 21:00
    
    student = models.ForeignKey(
        Student, 
        on_delete=models.CASCADE,
        related_name='schedules'
    )
    weekday = models.IntegerField(
        choices=WEEKDAY_CHOICES,
        verbose_name='Dia da Semana'
    )
    hour = models.IntegerField(
        choices=HOUR_CHOICES,
        verbose_name='Horário'
    )
    
    class Meta:
        verbose_name = 'Horário do Aluno'
        verbose_name_plural = 'Horários dos Alunos'
        ordering = ['weekday', 'hour']
        unique_together = ['student', 'weekday', 'hour']  # Previne horários duplicados
        
    def __str__(self):
        return f'{self.student.name} - {self.get_weekday_display()} {self.get_hour_display()}'
