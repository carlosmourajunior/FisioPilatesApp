import api from '../utils/axios';
import { ClinicCommissionPayment } from '../types/payment';

export const CommissionPaymentService = {
  getAll: async (queryParams: string = '') => {
    const response = await api.get(`/api/payments/commission/${queryParams}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get(`/api/payments/commission/${id}/`);
    return response.data;
  },

  create: async (data: ClinicCommissionPayment) => {
    const { id, created_at, ...payload } = data;
    const response = await api.post('/api/payments/commission/', payload);
    return response.data;
  },

  update: async (id: number, data: Partial<ClinicCommissionPayment>) => {
    const response = await api.patch(`/api/payments/commission/${id}/`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/api/payments/commission/${id}/`);
  },
  
  getCommissionsDue: async (physiotherapistId: number) => {
    const response = await api.get(`/api/payments/commission/due/${physiotherapistId}/`);
    return response.data;
  }
};
