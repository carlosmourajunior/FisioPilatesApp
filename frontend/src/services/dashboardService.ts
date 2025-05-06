import api from '../utils/axios';

export interface PhysiotherapistSummary {
  id: number;
  name: string;
  total_students: number;
  paid_students: number;
  pending_students: number;
  total_received?: number;
  total_month_revenue: number;
  commission_to_pay: number;
}

export interface MonthSummary {
  year: number;
  month: number;
  is_current: boolean;
  is_future?: boolean;
  total_students: number;
  paid_students: number;
  pending_students: number;
  total_received: number;
  total_expected: number;
  total_pending: number;
  physiotherapist_breakdown: PhysiotherapistSummary[];
}

interface CurrentMonthSummary {
  total_received: number;
  total_expected: number;
  total_pending: number;
  total_overdue: number;
  total_commissions: number;
  total_expected_commissions: number;
}

export interface DashboardSummary {
  total_students: number;
  monthly_summary: MonthSummary[];
  current_month_summary: CurrentMonthSummary;
  physiotherapist_summary?: PhysiotherapistSummary[];
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await api.get('/api/payments/dashboard_summary/');
  return response.data;
};
