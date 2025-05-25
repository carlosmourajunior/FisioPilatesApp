export interface Physiotherapist {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  crefito: string;
  phone: string;
  specialization: string;
  active: boolean;
}
