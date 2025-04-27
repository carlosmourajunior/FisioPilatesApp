import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  IconButton,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

interface Schedule {
  id?: number;
  weekday: number;
  hour: number;
}

interface Props {
  schedules: Schedule[];
  onChange: (schedules: Schedule[]) => void;
}

const StudentScheduling: React.FC<Props> = ({ schedules, onChange }) => {
  const [newSchedule, setNewSchedule] = useState<Schedule>({
    weekday: 0,
    hour: 6,
  });

  const weekdays = [
    { value: 0, label: 'Segunda-feira' },
    { value: 1, label: 'Terça-feira' },
    { value: 2, label: 'Quarta-feira' },
    { value: 3, label: 'Quinta-feira' },
    { value: 4, label: 'Sexta-feira' },
    { value: 5, label: 'Sábado' },
    { value: 6, label: 'Domingo' },
  ];

  const hours = Array.from({ length: 16 }, (_, i) => i + 6).map(hour => ({
    value: hour,
    label: `${hour.toString().padStart(2, '0')}:00`
  }));

  const handleAddSchedule = () => {
    const isDuplicate = schedules.some(
      schedule => schedule.weekday === newSchedule.weekday && schedule.hour === newSchedule.hour
    );

    if (!isDuplicate) {
      onChange([...schedules, { ...newSchedule }]);
      setNewSchedule({ weekday: 0, hour: 6 });
    }
  };

  const handleRemoveSchedule = (index: number) => {
    const newSchedules = schedules.filter((_, i) => i !== index);
    onChange(newSchedules);
  };

  const getWeekdayLabel = (value: number) => {
    return weekdays.find(day => day.value === value)?.label || '';
  };

  const getHourLabel = (value: number) => {
    return hours.find(hour => hour.value === value)?.label || '';
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Horários Semanais
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <FormControl fullWidth>
              <InputLabel>Dia da Semana</InputLabel>
              <Select
                value={newSchedule.weekday}
                label="Dia da Semana"
                onChange={(e) => setNewSchedule({ ...newSchedule, weekday: e.target.value as number })}
              >
                {weekdays.map((day) => (
                  <MenuItem key={day.value} value={day.value}>
                    {day.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={5}>
            <FormControl fullWidth>
              <InputLabel>Horário</InputLabel>
              <Select
                value={newSchedule.hour}
                label="Horário"
                onChange={(e) => setNewSchedule({ ...newSchedule, hour: e.target.value as number })}
              >
                {hours.map((hour) => (
                  <MenuItem key={hour.value} value={hour.value}>
                    {hour.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleAddSchedule}
              startIcon={<AddIcon />}
            >
              Adicionar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {schedules.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Horários Agendados:
          </Typography>
          {schedules.map((schedule, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1,
                borderBottom: index < schedules.length - 1 ? '1px solid #eee' : 'none'
              }}
            >
              <Typography>
                {getWeekdayLabel(schedule.weekday)} às {getHourLabel(schedule.hour)}
              </Typography>
              <IconButton
                onClick={() => handleRemoveSchedule(index)}
                color="error"
                size="small"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default StudentScheduling;
