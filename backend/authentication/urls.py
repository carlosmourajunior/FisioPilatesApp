from django.urls import path
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from . import views

urlpatterns = [
    path('login/', ensure_csrf_cookie(views.login_view), name='login'),
    path('register/', ensure_csrf_cookie(views.register_view), name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('user/', views.get_user_data, name='user'),
    path('update-profile/', views.update_profile, name='update-profile'),
    path('change-password/', views.change_password, name='change-password'),
]