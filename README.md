# Generic App

Um aplicativo web moderno construído com React (TypeScript) no frontend e Django no backend, utilizando Docker para containerização.

## 🚀 Estrutura do Projeto

O projeto está dividido em duas partes principais:

### Frontend (React + TypeScript)
- Interface moderna usando Material-UI
- Gerenciamento de estado com Context API
- Sistema de roteamento com React Router
- TypeScript para tipagem estática
- Autenticação de usuários integrada

### Backend (Django)
- API REST com Django REST Framework
- Sistema de autenticação robusto
- Banco de dados SQLite (pode ser facilmente alterado para PostgreSQL)
- Sistema de migração de banco de dados

## 📋 Pré-requisitos

Para rodar o projeto, você precisa ter instalado:

- Docker
- Docker Compose
- Node.js (para desenvolvimento local do frontend)
- Python 3.11+ (para desenvolvimento local do backend)

## 🔧 Instalação

### Usando Docker (Recomendado)

1. Clone o repositório:
```bash
git clone https://github.com/carlosmourajunior/generic_app.git
cd generic_app
```

2. Inicie os containers com Docker Compose:
```bash
docker-compose up --build
```

O aplicativo estará disponível em:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### Instalação Manual (Desenvolvimento)

#### Frontend

1. Navegue até a pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm start
```

#### Backend

1. Navegue até a pasta do backend:
```bash
cd backend
```

2. Crie um ambiente virtual:
```bash
python -m venv venv
```

3. Ative o ambiente virtual:
- Windows:
```bash
venv\Scripts\activate
```
- Linux/Mac:
```bash
source venv/bin/activate
```

4. Instale as dependências:
```bash
pip install -r requirements.txt
```

5. Execute as migrações:
```bash
python manage.py migrate
```

6. Inicie o servidor:
```bash
python manage.py runserver
```

## 🛠️ Tecnologias Utilizadas

- **Frontend**:
  - React 18
  - TypeScript
  - Material-UI
  - React Router
  - Axios
  - Context API

- **Backend**:
  - Django
  - Django REST Framework
  - SQLite (banco de dados)

- **DevOps**:
  - Docker
  - Docker Compose
  - Git

## 📦 Estrutura de Diretórios

```
.
├── frontend/                # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── contexts/       # Context API
│   │   ├── utils/          # Utilitários
│   │   └── ...
│   └── ...
├── backend/                # API Django
│   ├── app/               # Configurações principais
│   ├── authentication/    # App de autenticação
│   └── ...
└── docker-compose.yml     # Configuração Docker
```

## 🔐 Autenticação

O sistema utiliza autenticação baseada em token JWT. O fluxo de autenticação inclui:
- Login
- Registro
- Recuperação de senha
- Gerenciamento de perfil

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📫 Contato

Seu Nome - [seu-email@exemplo.com](mailto:seu-email@exemplo.com)

Link do projeto: [https://github.com/carlosmourajunior/generic_app](https://github.com/carlosmourajunior/generic_app)