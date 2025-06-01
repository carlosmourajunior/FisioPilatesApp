import React, { useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import ptBRLocale from '@fullcalendar/core/locales/pt-br';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { BaseLayout } from '../shared/BaseLayout';
import api from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';

// Array de cores para os fisioterapeutas
const PHYSIO_COLORS = [
  '#2E8B57', // Verde esmeralda (cor original)
  '#4682B4', // Azul aço
  '#8B008B', // Magenta escuro
  '#CD853F', // Peru
  '#556B2F', // Verde oliva escuro
  '#8B4513', // Marrom sela
  '#483D8B', // Azul ardósia escuro
  '#6B8E23', // Verde oliva
  '#BC8F8F', // Rosado
  '#DB7093', // Violeta pálido
] as const;

interface Student {
  id: number;
  name: string;
  active: boolean;
  physiotherapist: number;
  modality_details?: {
    name: string;
  };
}

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor?: string;
  extendedProps?: {
    students: Student[];
    count: number;
    physiotherapistId: number;
  };
}

interface Physiotherapist {
  id: number;
  first_name: string;
  last_name: string;
}

const StudentCalendar: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [events, setEvents] = useState<Event[]>([]);
  const [physiotherapists, setPhysiotherapists] = useState<Physiotherapist[]>([]);
  const [selectedPhysiotherapist, setSelectedPhysiotherapist] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const getPhysiotherapistColor = useCallback((physiotherapistId: number) => {
    // Se não houver fisioterapeuta selecionado, usar o índice do fisioterapeuta para a cor
    const index = physiotherapists.findIndex(p => p.id === physiotherapistId);
    return PHYSIO_COLORS[index % PHYSIO_COLORS.length];
  }, [physiotherapists]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const params: any = {};
        if (!user?.is_staff) {
          params.physiotherapist = user?.id;
        } else if (selectedPhysiotherapist) {
          params.physiotherapist = selectedPhysiotherapist;
        }

        const response = await api.get('/api/students/', { params });
        const students = response.data.filter((student: Student) => student.physiotherapist);
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Segunda-feira

        // Criar um mapa para agrupar alunos por horário
        const scheduleMap = new Map();

        // Primeiro, agrupe todos os alunos por dia da semana e hora
        students.forEach((student: any) => {
          (student.schedules || []).forEach((schedule: any) => {
            const eventDate = new Date(startOfWeek);
            eventDate.setDate(startOfWeek.getDate() + schedule.weekday);
            
            const timeKey = `${eventDate.toISOString().split('T')[0]}-${schedule.hour}`;
            if (!scheduleMap.has(timeKey)) {
              scheduleMap.set(timeKey, {
                students: [],
                date: eventDate,
                hour: schedule.hour
              });
            }
            scheduleMap.get(timeKey).students.push(student);
          });
        });

        // Converter o mapa em eventos
        let newEvents: Event[] = [];
        
        // Função para criar um evento a partir dos dados agrupados
        const createEventFromGroup = (timeKey: string, data: any) => {
          const firstStudent = data.students[0];
          return {
            id: timeKey,
            title: `${data.students.length} aluno(s)`,
            start: `${data.date.toISOString().split('T')[0]}T${String(data.hour).padStart(2, '0')}:00:00`,
            end: `${data.date.toISOString().split('T')[0]}T${String(data.hour + 1).padStart(2, '0')}:00:00`,
            backgroundColor: selectedPhysiotherapist 
              ? PHYSIO_COLORS[0] // Cor padrão quando um fisio está selecionado
              : getPhysiotherapistColor(firstStudent.physiotherapist),
            extendedProps: {
              students: data.students,
              count: data.students.length,
              physiotherapistId: firstStudent.physiotherapist
            }
          };
        };

        // Criar eventos para a semana atual
        scheduleMap.forEach((data, timeKey) => {
          newEvents.push(createEventFromGroup(timeKey, data));
        });

        // Duplicar eventos para as próximas semanas do mês
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        let currentDate = new Date(startOfWeek);
        currentDate.setDate(currentDate.getDate() + 7); // Começar da próxima semana

        while (currentDate <= endOfMonth) {
          scheduleMap.forEach((data, timeKey) => {
            const nextDate = new Date(currentDate);
            nextDate.setDate(currentDate.getDate() + data.date.getDay() - currentDate.getDay());
            
            const nextTimeKey = `${nextDate.toISOString().split('T')[0]}-${data.hour}`;
            const nextData = {
              ...data,
              date: nextDate
            };
            
            newEvents.push(createEventFromGroup(nextTimeKey, nextData));
          });
          
          currentDate.setDate(currentDate.getDate() + 7);
        }

        setEvents(newEvents);
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
      }
    };    fetchEvents();
  }, [user, selectedPhysiotherapist, physiotherapists, getPhysiotherapistColor]);

  useEffect(() => {
    const fetchPhysiotherapists = async () => {
      if (user?.is_staff) {
        try {
          const response = await api.get('/api/physiotherapists/');
          setPhysiotherapists(response.data);
        } catch (error) {
          console.error('Erro ao buscar fisioterapeutas:', error);
        }
      }
    };

    fetchPhysiotherapists();
  }, [user]);
  return (
    <BaseLayout>
      <Box sx={{ p: isMobile ? 2 : 3 }}>
        <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
          Calendário de Alunos
        </Typography>

        <Paper sx={{ p: isMobile ? 2 : 3, mb: 3 }}>
          {user?.is_staff && (
            <FormControl 
              fullWidth 
              sx={{ mb: 3 }}
              size={isMobile ? "small" : "medium"}
            >
              <InputLabel id="physiotherapist-select-label">Fisioterapeuta</InputLabel>
              <Select
                labelId="physiotherapist-select-label"
                value={selectedPhysiotherapist || ''}
                onChange={(e) => setSelectedPhysiotherapist(e.target.value ? Number(e.target.value) : null)}
                label="Fisioterapeuta"
              >
                <MenuItem value="">
                  <em>Todos</em>
                </MenuItem>
                {physiotherapists.map((physio, index) => (
                  <MenuItem key={physio.id} value={physio.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: PHYSIO_COLORS[index % PHYSIO_COLORS.length],
                        }}
                      />
                      {`${physio.first_name} ${physio.last_name}`}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}          <Box sx={{ 
            '.fc': { 
              maxWidth: '100%',
              fontSize: isMobile ? '0.8rem' : '1rem',
            },
            '.fc-toolbar-title': {
              fontSize: isMobile ? '1.2rem !important' : '1.5rem !important',
            },
            '.fc-toolbar': {
              flexWrap: 'wrap',
              gap: 1
            },
            '.fc-toolbar-chunk': {
              display: 'flex',
              gap: 0.5
            },
            '.fc-button': {
              padding: isMobile ? '4px 8px !important' : '6px 12px !important',
              fontSize: isMobile ? '0.8rem !important' : '1rem !important'
            }
          }}>
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
              initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
              headerToolbar={{
                left: isMobile ? 'prev,next' : 'prev,next today',
                center: 'title',
                right: isMobile ? 'timeGridDay,listWeek' : 'timeGridWeek,timeGridDay,dayGridMonth,listWeek',
              }}
              locale={ptBRLocale}
              events={events}
              editable={false}
              selectable={false}
              height={isMobile ? "auto" : 650}
              slotMinTime="06:00:00"
              slotMaxTime="22:00:00"
              allDaySlot={false}
              weekends={true}
              slotDuration={isMobile ? '00:30:00' : '01:00:00'}
              businessHours={{
                daysOfWeek: [1, 2, 3, 4, 5, 6],
                startTime: '06:00',
                endTime: '22:00',
              }}
              eventClick={(info) => {
                setSelectedEvent(info.event as any);
                setIsModalOpen(true);
              }}
            />
          </Box>
        </Paper>

        <Dialog 
          open={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant={isMobile ? "subtitle1" : "h6"}>
                Alunos do Horário - {selectedEvent?.start ? new Date(selectedEvent.start).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                }) : ''}
              </Typography>
              <IconButton onClick={() => setIsModalOpen(false)} size={isMobile ? "small" : "medium"}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <List>
              {selectedEvent?.extendedProps?.students.map((student: Student) => (
                <ListItem key={student.id}>
                  <ListItemText
                    primary={student.name}
                    secondary={
                      <>
                        {student.modality_details?.name || 'Sem modalidade'}
                        {physiotherapists.find(p => p.id === student.physiotherapist) && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            Fisioterapeuta: {
                              physiotherapists.find(p => p.id === student.physiotherapist)?.first_name
                            } {
                              physiotherapists.find(p => p.id === student.physiotherapist)?.last_name
                            }
                          </Typography>
                        )}
                      </>
                    }
                  />
                  <Chip
                    label={student.active ? 'Ativo' : 'Inativo'}
                    color={student.active ? 'success' : 'default'}
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
        </Dialog>
      </Box>
    </BaseLayout>
  );
};

export default StudentCalendar;
