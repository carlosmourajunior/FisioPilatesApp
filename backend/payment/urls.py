from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, ClinicCommissionPaymentViewSet

router = DefaultRouter()
router.register(r'commission', ClinicCommissionPaymentViewSet, basename='commission-payments')
router.register('', PaymentViewSet, basename='payments')

urlpatterns = [
    path('', include(router.urls)),
]
