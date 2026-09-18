@echo off
title Distributed Digital Commerce ^& Inventory Intelligence Platform
echo ==============================================================================
echo DISTRIBUTED DIGITAL COMMERCE ^& INVENTORY INTELLIGENCE PLATFORM
echo Course: 25CS1302E - DBS-DBD (KL University Aziz Nagar)
echo Database: PostgreSQL (klhdb) ^& MongoDB (distributed_commerce_db)
echo ==============================================================================
echo.

echo [1/3] Checking MongoDB NoSQL daemon...
if not exist "data\mongodb" mkdir "data\mongodb"
powershell -Command "if (!(Get-NetTCPConnection -LocalPort 27017 -ErrorAction SilentlyContinue)) { Start-Process 'C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe' -ArgumentList '--dbpath \"\"%~dp0data\mongodb\"\" --port 27017' -WindowStyle Hidden; Start-Sleep -Seconds 2 }"

echo [2/3] Initializing and verifying demonstration database on PostgreSQL (klhdb)...
python seeds/seed_data.py

echo.
echo [3/3] Launching Web Dashboard on http://127.0.0.1:5000...
echo.
start http://127.0.0.1:5000
python backend/app.py
pause
