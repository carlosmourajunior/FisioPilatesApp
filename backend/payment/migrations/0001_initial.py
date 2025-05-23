# Generated by Django 5.2 on 2025-04-29 15:37

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('modality', '0004_alter_modality_options_modality_payment_type'),
        ('student', '0006_student_commission'),
    ]

    operations = [
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Valor Pago')),
                ('payment_date', models.DateField(verbose_name='Data do Pagamento')),
                ('reference_month', models.DateField(blank=True, help_text='Mês de referência para pagamentos mensais', null=True, verbose_name='Mês de Referência')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('modality', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='payments', to='modality.modality', verbose_name='Modalidade')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='payments', to='student.student', verbose_name='Aluno')),
            ],
            options={
                'verbose_name': 'Pagamento',
                'verbose_name_plural': 'Pagamentos',
                'ordering': ['-payment_date'],
            },
        ),
    ]
