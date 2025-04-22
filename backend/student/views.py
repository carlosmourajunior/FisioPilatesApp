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
        physiotherapist = None
        if not self.request.user.is_staff:
            # If the user is a physiotherapist, automatically assign them
            try:
                physiotherapist = self.request.user.physiotherapist
            except:
                pass
        elif 'physiotherapist' not in serializer.validated_data:
            # If admin user and no physiotherapist specified, don't assign one
            pass
            
        serializer.save(physiotherapist=physiotherapist)
