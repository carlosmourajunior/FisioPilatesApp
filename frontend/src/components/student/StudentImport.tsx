import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { BaseLayout } from '../shared/BaseLayout';
import { CloudUpload as CloudUploadIcon, Download as DownloadIcon } from '@mui/icons-material';
import api from '../../utils/axios';

const StudentImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const downloadTemplate = async () => {
    try {
      const response = await api.get('/api/students/template/', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'template_importacao_alunos.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erro ao baixar template:', error);
      setError('Erro ao baixar o template. Por favor, tente novamente.');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError('Por favor, selecione um arquivo para importar.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      setError(null);
      const response = await api.post('/api/students/import_students/', formData);
      setResult(response.data);
    } catch (error: any) {
      console.error('Erro ao importar alunos:', error);
      setError(error.response?.data?.error || 'Erro ao importar alunos. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Importar Alunos
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Instruções
          </Typography>
          <Typography paragraph>
            1. Faça o download do template de importação clicando no botão abaixo
          </Typography>
          <Typography paragraph>
            2. Preencha o arquivo com os dados dos alunos (campos com * são obrigatórios)
          </Typography>
          <Typography paragraph>
            3. Salve o arquivo e faça o upload usando o formulário abaixo
          </Typography>
          
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadTemplate}
            sx={{ mb: 3 }}
          >
            Download Template
          </Button>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <input
                accept=".xlsx"
                style={{ display: 'none' }}
                id="raised-button-file"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="raised-button-file">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                >
                  Selecionar Arquivo
                </Button>
              </label>
              {file && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Arquivo selecionado: {file.name}
                </Typography>
              )}
            </Box>

            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={!file || loading}
              sx={{ mb: 3 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Importar Alunos'}
            </Button>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {result && (
              <Box>
                <Alert 
                  severity={result.errors.length > 0 ? "warning" : "success"}
                  sx={{ mb: 2 }}
                >
                  {result.created} alunos importados com sucesso.
                </Alert>

                {result.created_students.length > 0 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Alunos Importados:
                    </Typography>
                    <List>
                      {result.created_students.map((name: string, index: number) => (
                        <ListItem key={index}>
                          <ListItemText primary={name} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {result.errors.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom color="error">
                      Erros na Importação:
                    </Typography>
                    <List>
                      {result.errors.map((error: any, index: number) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={`Linha ${error.row}: ${error.name}`}
                            secondary={JSON.stringify(error.errors)}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </Box>
            )}
          </form>
        </Paper>
      </Box>
    </BaseLayout>
  );
};

export default StudentImport;
