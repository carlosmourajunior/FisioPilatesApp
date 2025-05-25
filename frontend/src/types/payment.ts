export interface Payment {
  id: number;
  student: number;
  student_details: {
    name: string;
    modality_details: {
      name: string;
      payment_type: 'MONTHLY' | 'SESSION';
      price: number;
    };
  };
  modality: number;
  amount: number;
  payment_date: string;
  reference_month: string | null;
  created_at: string;
}

export interface PaymentStatus {
  payment_type: 'MONTHLY' | 'SESSION';
  paid_current_month?: boolean;
  modality_price?: number;
  total_value?: number;
  total_paid?: number;
  remaining_value?: number;
  session_quantity?: number;
  session_price?: number;
}

export interface PaymentFormData {
  student: number;
  modality: number;
  amount: number;
  payment_date: Date;
  reference_month?: Date | null;
}

export interface ClinicCommissionPayment {
  id?: number;
  physiotherapist: number;
  physiotherapist_details?: {
    user: {
      first_name: string;
      last_name: string;
    };
  };
  transfer_date: string;
  total_commission_due: number;
  amount_paid: number;
  description: string;
  status: 'awaiting_approval' | 'approved';
  created_at?: string;
}

export interface CommissionsDue {
  total_commission_due: number;
  total_paid: number;
  total_commission: number;
  month: string;
  details: {
    student_name: string;
    payment_date: string;
    payment_amount: number;
    commission_rate: number;
    commission_amount: number;
  }[];
}
