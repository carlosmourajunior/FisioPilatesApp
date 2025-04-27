from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentScheduleViewSet

router = DefaultRouter()
router.register(r'', StudentScheduleViewSet)

urlpatterns = router.urls
