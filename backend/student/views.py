from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Student
from .serializers import StudentSerializer
from physiotherapist.models import Physiotherapist

class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = Student.objects.all()
        if not self.request.user.is_staff:
            # If user is a physiotherapist, only show their students
            try:
                physiotherapist = self.request.user.physiotherapist
                queryset = queryset.filter(physiotherapist=physiotherapist)
            except:
                queryset = Student.objects.none()
                
        active = self.request.query_params.get('active', None)
        if active is not None:
            queryset = queryset.filter(active=active.lower() == 'true')
        return queryset

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            # Se o usuário é um fisioterapeuta, atribuir automaticamente
            try:
                physiotherapist = self.request.user.physiotherapist
                serializer.save(physiotherapist=physiotherapist)
            except:
                serializer.save()
        else:
            # Se é admin, usa o fisioterapeuta selecionado no frontend ou None
            serializer.save()

    def perform_update(self, serializer):
        if not self.request.user.is_staff:
            # Se o usuário é um fisioterapeuta, manter ele como responsável
            try:
                physiotherapist = self.request.user.physiotherapist
                serializer.save(physiotherapist=physiotherapist)
            except:
                serializer.save()
        else:
            # Se é admin, usa o fisioterapeuta selecionado no frontend ou mantém o atual
            serializer.save()
