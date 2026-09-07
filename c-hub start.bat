@echo off
title C-HUB System Launcher
echo ========================================
echo    C-HUB ONLINE STORE SYSTEM LAUNCHER
echo ========================================
echo.

set "ROOT=C:\Users\abcd\Desktop"

echo [1/3] Starting BACKEND server (port 3006)...
pushd "%ROOT%\c-hub-backend"
start "C-HUB Backend (3006)" cmd /k "node server.js"
popd
timeout /t 2 /nobreak >nul

echo [2/3] Starting STORE frontend (port 3004)...
pushd "%ROOT%\c-hub-store"
start "C-HUB Store (3004)" cmd /k "npm run dev"
popd
timeout /t 2 /nobreak >nul

echo [3/3] Starting ADMIN panel (port 3005)...
pushd "%ROOT%\c-hub-admin"
start "C-HUB Admin (3005)" cmd /k "npm run dev:frontend"
popd
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo  All services are starting...
echo    Backend  : http://localhost:3006
echo    Store    : http://localhost:3004
echo    Admin    : http://localhost:3005
echo ========================================
echo.
echo Opening Store in your browser...
start http://localhost:3004
echo.
echo Done! Keep the terminal windows open.
pause
