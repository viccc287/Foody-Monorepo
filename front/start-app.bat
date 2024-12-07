@echo off

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js no está instalado. Por favor, instala Node.js y vuelve a intentarlo.
    pause
    exit /b
)

echo Iniciando servidor...
start "" npx serve -l 5000 -s

timeout /t 2 >nul

echo Abriendo navegador...
start "" http://localhost:5000

exit
