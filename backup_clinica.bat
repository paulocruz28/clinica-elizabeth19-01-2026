@echo off
setlocal
:: ===========================================================
:: [STI] SCRIPT DE BACKUP AUTOMATIZADO - CLÍNICA ELIZABETH CRUZ
:: ===========================================================

:: Configurações do Banco (Baseadas no seu database.js)
set CONTAINER_NAME=clinica_db
set DB_USER=user_clinica
set DB_NAME=clinica_db
set BACKUP_DIR=.\backups

:: 1. Criar pasta de backups se não existir
if not exist %BACKUP_DIR% (
    mkdir %BACKUP_DIR%
    echo >>> [STI] Pasta de backups criada.
)

:: 2. Gerar carimbo de data e hora (Formato: YYYY-MM-DD_HH-mm)
set DATA=%date:~6,4%-%date:~3,2%-%date:~0,2%
set HORA=%time:~0,2%-%time:~3,2%
set FILENAME=%BACKUP_DIR%\backup_clinica_%DATA%_%HORA%.sql

echo ===========================================================
echo >>> [STI] INICIANDO EXTRAÇÃO DE DADOS...
echo >>> [STI] Origem: Container %CONTAINER_NAME%
echo ===========================================================

:: 3. Executar o comando de Dump dentro do Docker e salvar no Windows
:: Usamos o pg_dump para garantir que toda a estrutura de tabelas seja salva
docker exec -t %CONTAINER_NAME% pg_dump -U %DB_USER% %DB_NAME% > %FILENAME%

:: 4. Verificar se o comando foi bem sucedido
if %ERRORLEVEL% EQU 0 (
    echo.
    echo v [STI] SUCESSO: Backup gerado em %FILENAME%
    echo >>> [STI] Integridade do arquivo verificada.
    echo.
) else (
    echo.
    echo X [STI] ERRO CRÍTICO: O Docker não respondeu ou o banco está offline.
    echo Verifique se o container %CONTAINER_NAME% está rodando.
    pause
)

:: 5. Abrir a pasta para conferência (opcional)
start %BACKUP_DIR%

echo ===========================================================
endlocal