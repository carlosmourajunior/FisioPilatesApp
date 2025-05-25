import api from '../utils/axios';
import { ClinicCommissionPayment, CommissionsDue } from '../types/payment';

export const CommissionPaymentService = {
  getCommissionsDue: async (physiotherapistId: number): Promise<CommissionsDue> => {
    const response = await api.get(`/api/payments/commission/due/${physiotherapistId}/`);
    return response.data;
  },
  
  listCommissionPayments: async (physiotherapistId?: number): Promise<ClinicCommissionPayment[]> => {
    let url = '/api/payments/commission/';
    if (physiotherapistId) {
      url += `?physiotherapist=${physiotherapistId}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  createCommissionPayment: async (data: Omit<ClinicCommissionPayment, 'id' | 'created_at' | 'physiotherapist_details'>): Promise<ClinicCommissionPayment> => {
    const response = await api.post('/api/payments/commission/', data);
    return response.data;
  },

  deleteCommissionPayment: async (id: number): Promise<void> => {
    await api.delete(`/api/payments/commission/${id}/`);
  }
};
