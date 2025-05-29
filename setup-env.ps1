# Script para configurar o ambiente FisioPilates no Windows
param([string]$Ambiente)

if (-not $Ambiente) {
    Write-Host "Uso: .\setup-env.ps1 [desenvolvimento|producao|custom]" -ForegroundColor Red
    exit 1
}

Write-Host "=== Configurador de Ambiente FisioPilates ===" -ForegroundColor Green
Write-Host ""

if ($Ambiente -eq "desenvolvimento" -or $Ambiente -eq "dev") {
    Write-Host "Configurando ambiente de desenvolvimento..." -ForegroundColor Green
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env" -Force
        
        $content = Get-Content ".env"
        $content = $content -replace "HOST_DOMAIN=.*", "HOST_DOMAIN=localhost"
        $content = $content -replace "HOST_IP=.*", "HOST_IP=127.0.0.1"
        $content = $content -replace "DEBUG=.*", "DEBUG=True"
        $content = $content -replace "REACT_APP_API_URL=.*", "REACT_APP_API_URL=http://localhost:8000"
        $content | Set-Content ".env"
        
        Write-Host "✓ Ambiente de desenvolvimento configurado!" -ForegroundColor Green
        Write-Host "Arquivo .env criado com configurações para localhost" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Arquivo .env.example não encontrado!" -ForegroundColor Red
        exit 1
    }
} elseif ($Ambiente -eq "producao" -or $Ambiente -eq "prod") {
    Write-Host "Configurando ambiente de produção..." -ForegroundColor Yellow
    
    if (Test-Path ".env.production") {
        Copy-Item ".env.production" ".env" -Force
        Write-Host "✓ Arquivo .env criado baseado em .env.production" -ForegroundColor Green
    } elseif (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env" -Force
        Write-Host "⚠ Arquivo .env.production não encontrado, usando .env.example" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Nenhum arquivo template encontrado!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "IMPORTANTE: Edite o arquivo .env com suas configurações de produção!" -ForegroundColor Red
    Write-Host "Execute: notepad .env" -ForegroundColor Yellow
} else {
    Write-Host "Opção inválida: $Ambiente" -ForegroundColor Red
    Write-Host "Use: desenvolvimento, producao" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== Próximos Passos ===" -ForegroundColor Green
Write-Host "1. Revise o arquivo .env criado"
Write-Host "2. Execute: docker-compose up --build"
Write-Host ""
Write-Host "Para mais informações, consulte: CONFIGURACAO-ENV.md" -ForegroundColor Yellow
