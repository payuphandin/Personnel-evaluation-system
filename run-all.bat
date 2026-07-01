@echo off
setlocal

echo Checking if Docker is running...

:: 1. ตรวจสอบว่า Docker กำลังทำงานอยู่หรือไม่
tasklist /FI "IMAGENAME eq Docker Desktop.exe" 2>NUL | find /I /N "Docker Desktop.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Docker Desktop is already running.
) else (
    echo Docker Desktop is not running. Starting Docker...
    :: ปรับ Path ให้ตรงกับที่ติดตั้ง Docker Desktop ไว้ในเครื่องคุณ (ส่วนใหญ่จะเป็นพาธนี้)
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    
    echo Waiting for Docker to start...
    :: วนลูปเช็คจนกว่า Docker จะพร้อมทำงาน
    :wait_docker
    timeout /t 5 >nul
    docker info >nul 2>&1
    if %errorlevel% neq 0 (
        echo Still waiting for Docker to initialize...
        goto wait_docker
    )
    echo Docker is ready!
)

:: 2. รันโปรเจกต์ของคุณต่อ
set COMPOSE_FILE=C:\Users\payuz\Desktop\project\docker-compose_mysql.yml
echo Checking and clearing existing containers...
docker compose -f "%COMPOSE_FILE%" down

echo Starting Docker containers...
docker compose -f "%COMPOSE_FILE%" up -d

echo Opening Frontend and Backend terminals...
start "Frontend" cmd /k "cd frontend && npm run dev"
start "Backend" cmd /k "cd backend && npm run dev"

echo Opening VS Code...
start code ./frontend
start code ./backend

echo All services started!
pause