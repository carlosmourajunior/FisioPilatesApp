from rest_framework import serializers
from .modality import Modality

class ModalitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Modality
        fields = ['id', 'name', 'description', 'frequency', 'price', 'active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']
