@echo off
echo Starting Expense Tracker Application...

echo.
echo Starting Backend Server...
start "Backend" cmd /k "cd /d A:\newExpense\backend && node server.js"

timeout /t 3 /nobreak >nul

echo.
echo Starting Frontend Server...
start "Frontend" cmd /k "cd /d A:\newExpense\frontend && npm run dev"

echo.
echo Application is starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause