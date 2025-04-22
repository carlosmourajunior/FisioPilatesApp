from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import Physiotherapist

class PhysiotherapistTests(TestCase):
    def setUp(self):
        # Create admin user
        self.admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )
        
        # Create regular user
        self.regular_user = User.objects.create_user(
            username='regular',
            email='regular@example.com',
            password='regularpass123'
        )
        
        # Create test physiotherapist
        self.physio_user = User.objects.create_user(
            username='physiotherapist',
            email='physio@example.com',
            password='physiopass123',
            first_name='Test',
            last_name='Physio'
        )
        
        self.physiotherapist = Physiotherapist.objects.create(
            user=self.physio_user,
            crefito='12345',
            phone='11999999999',
            specialization='General'
        )
        
        self.client = APIClient()

    def test_list_physiotherapists_admin_access(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/physiotherapists/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_list_physiotherapists_regular_user_forbidden(self):
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get('/api/physiotherapists/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_physiotherapist(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'username': 'newphysio',
            'email': 'newphysio@example.com',
            'password': 'newphysiopass123',
            'password_confirm': 'newphysiopass123',
            'first_name': 'New',
            'last_name': 'Physio',
            'crefito': '67890',
            'phone': '11988888888',
            'specialization': 'Orthopedics'
        }
        response = self.client.post('/api/physiotherapists/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newphysio').exists())
        self.assertTrue(Physiotherapist.objects.filter(crefito='67890').exists())

    def test_update_physiotherapist(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'phone': '11977777777',
            'specialization': 'Sports'
        }
        response = self.client.patch(f'/api/physiotherapists/{self.physiotherapist.id}/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.physiotherapist.refresh_from_db()
        self.physiotherapist.user.refresh_from_db()
        self.assertEqual(self.physiotherapist.user.first_name, 'Updated')
        self.assertEqual(self.physiotherapist.phone, '11977777777')
