import api from '../utils/axios';

export const PaymentService = {
  createPayment: async (paymentData: any) => {
    const response = await api.post('/api/payments/', paymentData);
    return response.data;
  },

  getPaymentStatus: async (studentId: number) => {
    const response = await api.get(`/api/payments/student_payment_status/?student=${studentId}`);
    return response.data;
  },

  listPayments: async (filters?: any) => {
    const response = await api.get('/api/payments/', { params: filters });
    return response.data;
  },
  deletePayment: async (paymentId: number) => {
    await api.delete(`/api/payments/${paymentId}/`);
  },
  getPaymentSummary: async (monthYear: string, physiotherapistId?: number) => {
    const params = new URLSearchParams({ month_year: monthYear });
    if (physiotherapistId) {
      params.append('physiotherapist', physiotherapistId.toString());
    }
    const response = await api.get(`/api/payments/summary/?${params.toString()}`);
    return response.data;
  }
};
