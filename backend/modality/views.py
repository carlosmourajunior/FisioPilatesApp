from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Modality
from .serializers import ModalitySerializer

class ModalityViewSet(viewsets.ModelViewSet):
    queryset = Modality.objects.all()
    serializer_class = ModalitySerializer
    permission_classes = [IsAuthenticated]
