@echo off
echo ====================================
echo FlacronAI - Clean Start Script
echo ====================================
echo.

echo [1/4] Killing all Node processes...
powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force"
timeout /t 2 /nobreak >nul


echo [2/4] Starting Backend Server...
start "FlacronAI Backend" cmd /k "cd backend && npm start"
timeout /t 5 /nobreak >nul
echo Backend started in new window!
echo.

echo [3/4] Starting Mobile App (with cache clear)...
start "FlacronAI Mobile" cmd /k "cd MobileApp && npx expo start --clear"
echo Mobile app started in new window!
echo.

echo [4/4] All services started!
echo.
echo ====================================
echo Services Running:
echo - Backend: http://localhost:3000
echo - Mobile: Check the Expo window
echo ====================================
echo.
echo Press any key to exit this window...
pause >nul
