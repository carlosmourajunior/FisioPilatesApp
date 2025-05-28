# FisioPilates PWA

Este projeto agora é um **Progressive Web App (PWA)** completo, oferecendo uma experiência similar a aplicativos nativos.

## 🚀 Funcionalidades PWA

### ✅ Recursos Implementados

- **📱 Instalável**: Pode ser instalado como um app nativo no desktop e mobile
- **🔄 Cache Inteligente**: Funciona offline com cache de dados e recursos
- **📋 Service Worker**: Gerenciamento automático de cache e atualizações
- **🔔 Notificações Push**: Suporte a notificações (quando permitido)
- **⚡ Carregamento Rápido**: Cache de recursos estáticos e APIs
- **📊 Métricas**: Monitoramento de performance com Web Vitals
- **🌐 Modo Offline**: Acesso a dados em cache quando sem conexão
- **🔄 Sincronização em Background**: Sync de dados quando voltar online

### 🎨 Interface PWA

- **Status de Rede**: Indicador visual de conexão online/offline
- **Prompt de Instalação**: Dialog intuitivo para instalação do app
- **Notificações de Atualização**: Alerta quando nova versão está disponível
- **Tema Adaptável**: Cores e tema otimizados para PWA

## 🐳 Docker e Ambiente

### Desenvolvimento
```bash
# Para desenvolvimento com hot reload
docker-compose up --build

# Acesse: http://localhost:3000
```

### Produção
```bash
# Para produção com PWA otimizado
docker-compose -f docker-compose.prod.yml up --build

# Acesse: http://localhost (porta 80)
```

## 📱 Como Instalar o App

### Desktop (Chrome, Edge, Firefox)
1. Acesse o sistema no navegador
2. Clique no ícone de instalação na barra de endereços
3. Ou use o dialog de instalação que aparece automaticamente
4. Confirme a instalação

### Mobile (Android/iOS)
1. Acesse o sistema no navegador mobile
2. No Android: Menu > "Adicionar à tela inicial"
3. No iOS: Compartilhar > "Adicionar à Tela de Início"

## 🛠️ Recursos Técnicos

### Cache Strategy
- **Precache**: HTML, CSS, JS principais
- **Runtime Cache**: APIs, imagens, fontes
- **Network First**: APIs dinâmicas
- **Cache First**: Recursos estáticos
- **Stale While Revalidate**: Fontes externas

### Service Worker
- Baseado em Workbox
- Cache automático de recursos
- Estratégias de cache inteligentes
- Sincronização em background
- Notificações push

### Offline Support
- Cache de dados essenciais
- Interface funcional offline
- Sincronização automática quando online
- Feedback visual do status de conexão

## 🔧 Configuração

### Variáveis de Ambiente
```env
REACT_APP_PWA=true
REACT_APP_API_URL=http://localhost:8000
```

### Build para PWA
```bash
npm run build:pwa
```

## 📊 Métricas e Performance

- **Lighthouse Score**: Otimizado para PWA
- **Core Web Vitals**: Monitoramento de performance
- **Service Worker**: Cache eficiente
- **Bundle Size**: Otimizado e comprimido

## 🔒 Segurança

- **HTTPS**: Obrigatório para PWA em produção
- **Content Security Policy**: Headers de segurança
- **Cache Security**: Cache seguro de recursos sensíveis

## 📱 Compatibilidade

### Navegadores Suportados
- ✅ Chrome 67+
- ✅ Firefox 68+
- ✅ Safari 11.1+
- ✅ Edge 79+

### Funcionalidades por Plataforma
- **Desktop**: Instalação, notificações, offline
- **Android**: Instalação, notificações, offline, background sync
- **iOS**: Instalação limitada, offline (notificações limitadas)

## 🚀 Próximos Passos

### Funcionalidades Futuras
- [ ] Push notifications server-side
- [ ] Background sync avançado
- [ ] Share API
- [ ] Payment Request API
- [ ] Web Share Target
- [ ] Shortcuts no app instalado

### Melhorias de Performance
- [ ] Pre-loading de rotas críticas
- [ ] Lazy loading otimizado
- [ ] Cache de dados offline expandido
- [ ] Compression avançada

## 📚 Documentação Adicional

- [Web App Manifest](./public/manifest.json)
- [Service Worker](./src/serviceWorker.ts)
- [PWA Hook](./src/hooks/usePWA.ts)
- [Nginx Config](./nginx.conf)

## 🆘 Troubleshooting

### Cache Issues
```bash
# Limpar cache do service worker
# No DevTools: Application > Storage > Clear storage

# Forçar atualização
# Ctrl+Shift+R (Windows/Linux) ou Cmd+Shift+R (Mac)
```

### PWA Not Installing
1. Verifique se está em HTTPS (produção)
2. Confirme se o manifest.json está correto
3. Verifique se o service worker está registrado
4. Veja o console para erros

---

**Nota**: Este PWA funciona perfeitamente com Docker e mantém toda a funcionalidade original do sistema, apenas com recursos aprimorados para uma experiência de app nativo.
