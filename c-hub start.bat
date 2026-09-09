@echo off
title C-HUB System Launcher
echo ========================================
echo    C-HUB ONLINE STORE SYSTEM LAUNCHER
echo ========================================
echo.

set "ROOT=C:\Users\abcd\Desktop"

echo [1/4] Starting STORE backend (port 3006)...
pushd "%ROOT%\c-hub-store"
start "C-HUB Store Backend (3006)" cmd /k "npm run dev:server"
popd
timeout /t 2 /nobreak >nul

echo [2/4] Starting STORE frontend (port 3004)...
pushd "%ROOT%\c-hub-store"
start "C-HUB Store (3004)" cmd /k "npm run dev"
popd
timeout /t 2 /nobreak >nul

echo [3/4] Starting ADMIN backend (port 3007)...
pushd "%ROOT%\c-hub-admin"
start "C-HUB Admin Backend (3007)" cmd /k "npm run dev:server"
popd
timeout /t 2 /nobreak >nul

echo [4/4] Starting ADMIN panel (port 3005)...
pushd "%ROOT%\c-hub-admin"
start "C-HUB Admin (3005)" cmd /k "npm run dev:frontend"
popd
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo  All services are starting...
echo    Store Backend : http://localhost:3006
echo    Store         : http://localhost:3004
echo    Admin Backend : http://localhost:3007
echo    Admin         : http://localhost:3005
echo ========================================
echo.
echo Opening Store in your browser...
start http://localhost:3004
echo.
echo Done! Keep the terminal windows open.
pause
