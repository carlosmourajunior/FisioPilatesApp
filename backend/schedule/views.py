from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import StudentSchedule
from .serializers import StudentScheduleSerializer
from student.models import Student

class StudentScheduleViewSet(viewsets.ModelViewSet):
    queryset = StudentSchedule.objects.all()
    serializer_class = StudentScheduleSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = StudentSchedule.objects.all()
        if not self.request.user.is_staff:
            # Se o usuário é um fisioterapeuta, mostrar apenas os horários de seus alunos
            try:
                physiotherapist = self.request.user.physiotherapist
                queryset = queryset.filter(student__physiotherapist=physiotherapist)
            except:
                queryset = StudentSchedule.objects.none()
                
        student_id = self.request.query_params.get('student', None)
        if student_id is not None:
            queryset = queryset.filter(student_id=student_id)
        return queryset
        
    def create(self, request, *args, **kwargs):
        # Verificar se o aluno tem modalidade mensal
        try:
            student = Student.objects.get(pk=request.data.get('student'))
            if not student.modality or student.modality.payment_type != 'MONTHLY':
                return Response(
                    {'error': 'Apenas alunos com modalidade mensal podem ter horários fixos.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Student.DoesNotExist:
            return Response(
                {'error': 'Aluno não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )
            
        return super().create(request, *args, **kwargs)
        
    def update(self, request, *args, **kwargs):
        # Verificar se o aluno tem modalidade mensal
        try:
            student = Student.objects.get(pk=request.data.get('student'))
            if not student.modality or student.modality.payment_type != 'MONTHLY':
                return Response(
                    {'error': 'Apenas alunos com modalidade mensal podem ter horários fixos.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Student.DoesNotExist:
            return Response(
                {'error': 'Aluno não encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )
            
        return super().update(request, *args, **kwargs)
