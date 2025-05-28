# 🚀 Como Executar o FisioPilates PWA com Docker

## 📋 Pré-requisitos
- Docker Desktop instalado
- Docker Compose

## 🛠️ Comandos para Execução

### 🔧 Desenvolvimento (com Hot Reload)
```bash
# Clone ou navegue até o diretório do projeto
cd "c:\Users\user\OneDrive\Documents\0 - AplicativoFisio\FisioPilates"

# Construir e executar em modo desenvolvimento
docker-compose up --build

# Ou em background
docker-compose up --build -d
```

**Acesse**: http://localhost:3000

### 🚀 Produção (PWA Otimizado)
```bash
# Clone ou navegue até o diretório do projeto
cd "c:\Users\user\OneDrive\Documents\0 - AplicativoFisio\FisioPilates"

# Construir e executar em modo produção
docker-compose -f docker-compose.prod.yml up --build

# Ou em background
docker-compose -f docker-compose.prod.yml up --build -d
```

**Acesse**: http://localhost (porta 80)

## 📱 Testando o PWA

### 1. Verificação Básica
- ✅ Acesse a aplicação no navegador
- ✅ Verifique se aparece o ícone de instalação na barra de endereços
- ✅ Teste o indicador de status online/offline

### 2. Instalação
- ✅ Clique no ícone de instalação ou use o dialog que aparece
- ✅ Confirme a instalação
- ✅ Teste o app instalado

### 3. Funcionalidades Offline
- ✅ Desconecte a internet
- ✅ Navegue pela aplicação
- ✅ Verifique se dados em cache funcionam

### 4. Atualizações
- ✅ Faça alterações no código
- ✅ Rebuild da aplicação
- ✅ Verifique se aparece notificação de atualização

## 🔍 Debug e Desenvolvimento

### Ver logs dos containers
```bash
# Logs do frontend
docker-compose logs frontend

# Logs do backend
docker-compose logs backend

# Logs do banco
docker-compose logs db

# Todos os logs
docker-compose logs -f
```

### Parar containers
```bash
# Parar desenvolvimento
docker-compose down

# Parar produção
docker-compose -f docker-compose.prod.yml down

# Parar e remover volumes
docker-compose down -v
```

### Reconstruir apenas o frontend
```bash
# Desenvolvimento
docker-compose build frontend
docker-compose up frontend

# Produção
docker-compose -f docker-compose.prod.yml build frontend
docker-compose -f docker-compose.prod.yml up frontend
```

## 🌐 URLs e Portas

### Desenvolvimento
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Django**: http://localhost:8000/admin

### Produção
- **Frontend PWA**: http://localhost (porta 80)
- **Backend API**: http://localhost:8000
- **Admin Django**: http://localhost:8000/admin

## 📊 Validação PWA

### Lighthouse Audit
1. Abra o Chrome DevTools (F12)
2. Vá para a aba "Lighthouse"
3. Selecione "Progressive Web App"
4. Execute o audit
5. Verifique se passa nos critérios PWA

### DevTools PWA
1. Abra o Chrome DevTools (F12)
2. Vá para "Application" > "Manifest"
3. Verifique se o manifest está carregado corretamente
4. Vá para "Application" > "Service Workers"
5. Verifique se o service worker está ativo

## 🐛 Troubleshooting

### Service Worker não carrega
```bash
# Limpe o cache do navegador
# Chrome: Ctrl+Shift+Delete

# Ou via DevTools:
# Application > Storage > Clear storage
```

### PWA não oferece instalação
- ✅ Verifique se está acessando via localhost ou HTTPS
- ✅ Confirme se o manifest.json está correto
- ✅ Verifique se o service worker está registrado

### Cache não funciona
- ✅ Verifique os logs do service worker no DevTools
- ✅ Confirme se as rotas da API estão sendo cacheadas
- ✅ Teste o modo offline

### Docker issues
```bash
# Limpar containers e reconstruir
docker-compose down
docker system prune -f
docker-compose up --build

# Verificar se portas estão livres
netstat -ano | findstr :3000
netstat -ano | findstr :8000
```

## 🎯 Checklist Final

- ✅ Sistema roda em Docker (desenvolvimento e produção)
- ✅ PWA instalável no desktop e mobile
- ✅ Funciona offline com cache inteligente
- ✅ Service worker ativo e funcionando
- ✅ Notificações PWA implementadas
- ✅ Indicadores de status de rede
- ✅ Cache de APIs e recursos estáticos
- ✅ Manifest.json configurado corretamente
- ✅ Nginx otimizado para PWA em produção
- ✅ Headers de segurança implementados

**🎉 Seu FisioPilates agora é um PWA completo rodando em Docker!**
