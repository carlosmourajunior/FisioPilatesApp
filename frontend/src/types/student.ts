export interface Modality {
  id: number;
  name: string;
  price: number;
  payment_type: 'MONTHLY' | 'SESSION';
}

export interface Student {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  registration_date: string;
  active: boolean;
  notes: string | null;
  payment_type: 'PRE' | 'POS';
  modality: number;
  modality_details?: Modality;
  physiotherapist: number | null;
  payment_date: string | null;
  session_quantity: number | null;
  commission: number;
}
