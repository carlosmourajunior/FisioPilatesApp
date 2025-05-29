# Configuração de Ambiente com Variáveis .env

Este sistema foi configurado para usar variáveis de ambiente, tornando-o flexível para diferentes ambientes (desenvolvimento, teste, produção).

## Arquivos de Configuração

### `.env` - Desenvolvimento Local
Arquivo principal para desenvolvimento local. Contém configurações padrão para `localhost`.

### `.env.example` - Exemplo de Configuração
Template com todas as variáveis disponíveis e suas descrições.

### `.env.production` - Produção
Template para configurações de produção. **IMPORTANTE**: Ajuste os valores antes de usar em produção.

## Variáveis Disponíveis

### Configurações do Servidor
- `HOST_DOMAIN`: Domínio ou hostname do servidor (ex: `meusite.com` ou `localhost`)
- `HOST_IP`: IP do servidor (ex: `192.168.1.100` ou `127.0.0.1`)
- `FRONTEND_PORT`: Porta do frontend React (padrão: `3000`)
- `BACKEND_PORT`: Porta do backend Django (padrão: `8000`)
- `NGINX_PORT`: Porta do nginx em produção (padrão: `80`)

### Configurações do Django
- `SECRET_KEY`: Chave secreta do Django (**OBRIGATÓRIO alterar em produção**)
- `DEBUG`: Modo debug (`True` para desenvolvimento, `False` para produção)

### Configurações do Banco de Dados
- `DB_NAME`: Nome do banco de dados
- `DB_USER`: Usuário do banco
- `DB_PASSWORD`: Senha do banco (**OBRIGATÓRIO alterar em produção**)
- `DB_HOST`: Host do banco (geralmente `db` no Docker)
- `DB_PORT`: Porta do banco (padrão: `5432`)

### Configurações do React
- `REACT_APP_API_URL`: URL da API do backend vista pelo frontend
- `REACT_APP_PWA`: Habilitar PWA (padrão: `true`)

## Como Configurar para Produção

### 1. Criar arquivo `.env` de produção
```bash
# Copie o template de produção
cp .env.production .env

# Edite o arquivo com suas configurações
nano .env
```

### 2. Configurações Essenciais para Produção

#### No arquivo `.env`:
```env
# Seu domínio ou IP de produção
HOST_DOMAIN=meusite.com
HOST_IP=192.168.1.100

# URLs da API
REACT_APP_API_URL=https://meusite.com/api

# Segurança
SECRET_KEY=gere-uma-chave-super-segura-aqui
DEBUG=False

# Banco de dados com senhas seguras
DB_PASSWORD=senha-super-segura-para-producao
```

### 3. Gerar SECRET_KEY segura
```python
# Execute no Python para gerar uma nova SECRET_KEY
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
```

### 4. Configurar HTTPS (Recomendado)
Se você tem HTTPS configurado, ajuste as URLs:
```env
REACT_APP_API_URL=https://meusite.com/api
```

## Exemplos de Configuração

### Desenvolvimento Local
```env
HOST_DOMAIN=localhost
HOST_IP=127.0.0.1
REACT_APP_API_URL=http://localhost:8000
DEBUG=True
```

### Servidor Local na Rede
```env
HOST_DOMAIN=192.168.1.100
HOST_IP=192.168.1.100
REACT_APP_API_URL=http://192.168.1.100:8000
DEBUG=False
```

### Produção com Domínio
```env
HOST_DOMAIN=fisiopilates.com.br
HOST_IP=203.0.113.10
REACT_APP_API_URL=https://fisiopilates.com.br/api
DEBUG=False
```

## Arquivos que Usam as Variáveis

### Backend (Django)
- `backend/app/settings.py`: Configurações principais do Django
- `backend/.env`: Variáveis específicas do backend

### Frontend (React)
- `frontend/src/utils/axios.ts`: Configuração da URL da API
- `frontend/.env`: Variáveis específicas do frontend

### Docker
- `docker-compose.yml`: Orquestração dos containers
- `.env`: Variáveis compartilhadas entre os serviços

## Comandos Úteis

### Executar em desenvolvimento
```bash
docker-compose up --build
```

### Executar em produção
```bash
# Use o arquivo .env.production
cp .env.production .env
docker-compose -f docker-compose.prod.yml up --build -d
```

### Verificar configurações atuais
```bash
# Ver variáveis carregadas
docker-compose config
```

## Segurança

### ⚠️ Importante para Produção:
1. **Nunca** commite arquivos `.env` com dados sensíveis
2. **Sempre** altere a `SECRET_KEY` em produção
3. **Use** senhas fortes para o banco de dados
4. **Configure** `DEBUG=False` em produção
5. **Use** HTTPS sempre que possível

### Arquivos no .gitignore:
```gitignore
.env
.env.local
.env.production
```

Mantenha apenas `.env.example` no repositório como template.
