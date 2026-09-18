@echo off
title Database Setup - Distributed Commerce Platform
echo ==============================================================================
echo INITIALIZING & SEEDING DATABASE (PostgreSQL klhdb & MongoDB)
echo ==============================================================================
if not exist "data\mongodb" mkdir "data\mongodb"
powershell -Command "if (!(Get-NetTCPConnection -LocalPort 27017 -ErrorAction SilentlyContinue)) { Start-Process 'C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe' -ArgumentList '--dbpath \"\"%~dp0data\mongodb\"\" --port 27017' -WindowStyle Hidden; Start-Sleep -Seconds 2 }"
python seeds/seed_data.py
echo.
echo Database setup completed successfully!
pause
