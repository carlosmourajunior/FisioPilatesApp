from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from .models import Physiotherapist

class PhysiotherapistSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    password = serializers.CharField(write_only=True, required=True)
    password_confirm = serializers.CharField(write_only=True, required=True)    
    
    class Meta:
        model = Physiotherapist
        fields = ('id', 'username', 'email', 'password', 'password_confirm',
                 'first_name', 'last_name', 'crefito', 'phone', 'specialization')
        read_only_fields = ('id',)
        error_messages = {
            'crefito': {
                'unique': 'Este número de CREFITO já está cadastrado no sistema.'
            }
        }

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "As senhas não coincidem"})
        
        try:
            validate_password(data['password'])
        except Exception as e:
            raise serializers.ValidationError({"password": list(e)})
        
        return data
    
    def create(self, validated_data):
        user_data = validated_data.pop('user')
        password = validated_data.pop('password')
        validated_data.pop('password_confirm')

        user = User.objects.create(**user_data)
        user.set_password(password)
        user.save()

        physiotherapist = Physiotherapist.objects.create(user=user, **validated_data)
        return physiotherapist

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        if user_data:
            for attr, value in user_data.items():
                setattr(instance.user, attr, value)
            instance.user.save()
        
        for attr, value in validated_data.items():
            if attr not in ('password', 'password_confirm'):
                setattr(instance, attr, value)
        
        instance.save()
        return instance
