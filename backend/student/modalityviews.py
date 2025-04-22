from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .modality import Modality
from .modalityserializer import ModalitySerializer

class ModalityViewSet(viewsets.ModelViewSet):
    queryset = Modality.objects.all()
    serializer_class = ModalitySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Modality.objects.all()
        active = self.request.query_params.get('active', None)
        if active is not None:
            queryset = queryset.filter(active=active.lower() == 'true')
        return queryset
