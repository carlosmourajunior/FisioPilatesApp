import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid
} from '@mui/material';
import api from '../../utils/axios';
import { Physiotherapist } from '../../types/physiotherapist';

interface PhysiotherapistSelectorProps {
  onSelect: (physiotherapistId: number) => void;
}

export const PhysiotherapistSelector: React.FC<PhysiotherapistSelectorProps> = ({
  onSelect
}) => {
  const [physiotherapists, setPhysiotherapists] = useState<Physiotherapist[]>([]);
  const [selectedPhysiotherapist, setSelectedPhysiotherapist] = useState<number | ''>('');

  useEffect(() => {
    const fetchPhysiotherapists = async () => {
      try {
        const response = await api.get('/api/physiotherapists/');
        setPhysiotherapists(response.data);
      } catch (error) {
        console.error('Erro ao carregar fisioterapeutas:', error);
      }
    };

    fetchPhysiotherapists();
  }, []);

  const handleChange = (event: any) => {
    const value = event.target.value;
    setSelectedPhysiotherapist(value);
    onSelect(value);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="physiotherapist-select-label">
              Selecione o Fisioterapeuta
            </InputLabel>
            <Select
              labelId="physiotherapist-select-label"
              value={selectedPhysiotherapist}
              onChange={handleChange}
              label="Selecione o Fisioterapeuta"
            >              {physiotherapists.map((physio) => (
                <MenuItem key={physio.id} value={physio.id}>
                  {`${physio.user.first_name} ${physio.user.last_name}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
};
