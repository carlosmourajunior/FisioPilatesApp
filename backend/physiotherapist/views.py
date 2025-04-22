from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from .models import Physiotherapist
from .serializers import PhysiotherapistSerializer

from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def physiotherapist_list_create(request):
    if request.method == 'GET':
        physiotherapists = Physiotherapist.objects.all()
        serializer = PhysiotherapistSerializer(physiotherapists, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = PhysiotherapistSerializer(data=request.data)
        if serializer.is_valid():
            try:
                # Validate password
                password = request.data.get('password')
                if password:
                    validate_password(password)
                
                physiotherapist = serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except ValidationError as e:
                return Response(
                    {'password': list(e.messages)},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def physiotherapist_detail(request, pk):
    physiotherapist = get_object_or_404(Physiotherapist, pk=pk)
    
    if request.method == 'GET':
        serializer = PhysiotherapistSerializer(physiotherapist)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = PhysiotherapistSerializer(physiotherapist, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        physiotherapist.user.delete()  # This will also delete the physiotherapist due to CASCADE
        return Response(status=status.HTTP_204_NO_CONTENT)
