from rest_framework import serializers
from .models import Modality

class ModalitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Modality
        fields = ['id', 'name', 'description', 'frequency', 'price', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
