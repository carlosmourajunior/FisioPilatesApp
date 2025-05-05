import api from '../utils/axios';

export interface Physiotherapist {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  crefito: string;
  phone: string;
  specialization: string;
}

export const PhysiotherapistService = {
  listPhysiotherapists: async () => {
    const response = await api.get('/api/physiotherapists/');
    return response.data;
  },

  getPhysiotherapist: async (id: number) => {
    const response = await api.get(`/api/physiotherapists/${id}/`);
    return response.data;
  },
};
