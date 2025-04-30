import api from '../utils/axios';

export interface PhysiotherapistSummary {
  id: number;
  name: string;
  total_students: number;
  paid_students: number;
  pending_students: number;
  total_received?: number;
}

export interface MonthSummary {
  year: number;
  month: number;
  total_students: number;
  paid_students: number;
  pending_students: number;
  total_received: number;
  total_expected: number;
  total_pending: number;
  physiotherapist_breakdown: PhysiotherapistSummary[];
}

export interface DashboardSummary {
  total_students: number;
  monthly_summary: MonthSummary[];
  physiotherapist_summary?: PhysiotherapistSummary[];
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await api.get('/api/payments/dashboard_summary/');
  return response.data;
};
