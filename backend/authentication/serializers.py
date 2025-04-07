from rest_framework import serializers
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        read_only_fields = ('id',)
        error_messages = {
            'username': {
                'required': 'O nome de usuário é obrigatório.',
                'unique': 'Este nome de usuário já está em uso.'
            },
            'email': {
                'invalid': 'Por favor, insira um endereço de email válido.',
                'unique': 'Este email já está em uso.'
            }
        }

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        error_messages={
            'required': 'A senha é obrigatória.',
            'blank': 'A senha não pode estar em branco.'
        }
    )
    password_confirm = serializers.CharField(
        write_only=True,
        error_messages={
            'required': 'A confirmação de senha é obrigatória.'
        }
    )
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'password_confirm', 'first_name', 'last_name')
        read_only_fields = ('id',)
        error_messages = {
            'username': {
                'required': 'O nome de usuário é obrigatório.',
                'unique': 'Este nome de usuário já está em uso.'
            },
            'email': {
                'invalid': 'Por favor, insira um endereço de email válido.',
                'unique': 'Este email já está em uso.'
            },
            'first_name': {
                'required': 'O nome é obrigatório.'
            },
            'last_name': {
                'required': 'O sobrenome é obrigatório.'
            }
        }
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "As senhas não coincidem"})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user