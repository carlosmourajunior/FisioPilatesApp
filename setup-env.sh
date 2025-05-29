#!/bin/bash

# Script para configurar o ambiente FisioPilates
# Este script ajuda a configurar as variáveis de ambiente para diferentes ambientes

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Configurador de Ambiente FisioPilates ===${NC}"
echo ""

# Verificar se há argumentos
if [ $# -eq 0 ]; then
    echo "Uso: $0 [desenvolvimento|producao|custom]"
    echo ""
    echo "Opções:"
    echo "  desenvolvimento  - Configurar para ambiente de desenvolvimento"
    echo "  producao        - Configurar para ambiente de produção"
    echo "  custom          - Configuração personalizada"
    echo ""
    exit 1
fi

AMBIENTE=$1

case $AMBIENTE in
    "desenvolvimento"|"dev")
        echo -e "${GREEN}Configurando ambiente de desenvolvimento...${NC}"
        cp .env.example .env
        
        # Configurações padrão para desenvolvimento
        sed -i 's/HOST_DOMAIN=.*/HOST_DOMAIN=localhost/' .env
        sed -i 's/HOST_IP=.*/HOST_IP=127.0.0.1/' .env
        sed -i 's/DEBUG=.*/DEBUG=True/' .env
        sed -i 's|REACT_APP_API_URL=.*|REACT_APP_API_URL=http://localhost:8000|' .env
        
        echo -e "${GREEN}✓ Ambiente de desenvolvimento configurado!${NC}"
        echo -e "${YELLOW}Arquivo .env criado com configurações para localhost${NC}"
        ;;
        
    "producao"|"prod")
        echo -e "${YELLOW}Configurando ambiente de produção...${NC}"
        
        if [ -f .env.production ]; then
            cp .env.production .env
            echo -e "${GREEN}✓ Arquivo .env criado baseado em .env.production${NC}"
        else
            cp .env.example .env
            echo -e "${YELLOW}⚠ Arquivo .env.production não encontrado, usando .env.example${NC}"
        fi
        
        echo -e "${RED}IMPORTANTE: Você precisa editar o arquivo .env com suas configurações de produção!${NC}"
        echo -e "${RED}Configurações obrigatórias:${NC}"
        echo "  - HOST_DOMAIN (seu domínio)"
        echo "  - HOST_IP (seu IP de produção)"
        echo "  - SECRET_KEY (gere uma nova chave secreta)"
        echo "  - DB_PASSWORD (senha segura para o banco)"
        echo "  - REACT_APP_API_URL (URL da sua API)"
        echo ""
        echo -e "${YELLOW}Execute: nano .env${NC}"
        ;;
        
    "custom")
        echo -e "${YELLOW}Configuração personalizada...${NC}"
        
        if [ ! -f .env ]; then
            cp .env.example .env
            echo -e "${GREEN}✓ Arquivo .env criado baseado em .env.example${NC}"
        else
            echo -e "${YELLOW}⚠ Arquivo .env já existe${NC}"
        fi
        
        echo ""
        echo "Configure as seguintes variáveis no arquivo .env:"
        echo ""
        
        read -p "Domínio/IP do servidor (ex: localhost, 192.168.1.100, meusite.com): " host_domain
        read -p "IP do servidor (ex: 127.0.0.1, 192.168.1.100): " host_ip
        read -p "URL da API (ex: http://localhost:8000, https://meusite.com/api): " api_url
        read -p "Ambiente de debug? (True/False): " debug
        
        # Aplicar configurações
        sed -i "s/HOST_DOMAIN=.*/HOST_DOMAIN=$host_domain/" .env
        sed -i "s/HOST_IP=.*/HOST_IP=$host_ip/" .env
        sed -i "s|REACT_APP_API_URL=.*|REACT_APP_API_URL=$api_url|" .env
        sed -i "s/DEBUG=.*/DEBUG=$debug/" .env
        
        echo -e "${GREEN}✓ Configurações aplicadas!${NC}"
        ;;
        
    *)
        echo -e "${RED}Opção inválida: $AMBIENTE${NC}"
        echo "Use: desenvolvimento, producao ou custom"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}=== Próximos Passos ===${NC}"
echo "1. Revise o arquivo .env criado"
echo "2. Execute: docker-compose up --build"
echo ""
echo -e "${YELLOW}Para mais informações, consulte: CONFIGURACAO-ENV.md${NC}"
