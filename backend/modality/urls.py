from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ModalityViewSet

router = DefaultRouter()
router.register(r'', ModalityViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
