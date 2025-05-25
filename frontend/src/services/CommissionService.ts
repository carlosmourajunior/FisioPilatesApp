import api from '../utils/axios';
import { ClinicCommissionPayment } from '../types/payment';

export const CommissionService = {
  createCommissionPayment: async (data: Partial<ClinicCommissionPayment>) => {
    const response = await api.post('/api/payments/commission/', data);
    return response.data;
  },

   deleteCommissionPayment: async (id: number) => {
    const response = await api.delete(`/api/payments/commission/${id}/`);
    return response.data;
  },
  
  getCommissionPayments: async (physiotherapistId?: number, status?: string) => {
    const params = new URLSearchParams();
    if (physiotherapistId) params.append('physiotherapist', physiotherapistId.toString());
    if (status) params.append('status', status);
    
    const response = await api.get(`/api/payments/commission/?${params.toString()}`);
    return response.data;
  },

  getDueCommissions: async (physiotherapistId: number) => {
    const response = await api.get(`/api/payments/commission/due/${physiotherapistId}/`);
    return response.data;
  },

  getTotalCommissionDue: async (physiotherapistId?: number) => {
    const params = new URLSearchParams();
    if (physiotherapistId) params.append('physiotherapist', physiotherapistId.toString());
    
    const response = await api.get(`/api/payments/commission/total_commission_due/?${params.toString()}`);
    return response.data;
  },

  approveCommissionPayment: async (id: number) => {
    const response = await api.post(`/api/payments/commission/${id}/approve/`);
    return response.data;
  }
};
