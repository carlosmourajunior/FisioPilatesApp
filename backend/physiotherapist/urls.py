from django.urls import path
from . import views

app_name = 'physiotherapist'

urlpatterns = [
    path('', views.physiotherapist_list_create, name='physiotherapist-list-create'),
    path('<int:pk>/', views.physiotherapist_detail, name='physiotherapist-detail'),
]
