@echo off
title PostgreSQL Password Reset Utility
color 0A
echo ====================================================================
echo             PostgreSQL Password Reset for Robotics System
echo ====================================================================
echo.

echo [1/4] Restarting PostgreSQL service to apply temporary access...
net stop postgresql-x64-18
net start postgresql-x64-18

echo.
echo [2/4] Setting password for user 'postgres' to: postgres
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -c "ALTER USER postgres WITH PASSWORD 'postgres';"

echo.
echo [3/4] Restoring secure authentication (scram-sha-256)...
powershell -Command "$c = Get-Content 'C:\Program Files\PostgreSQL\18\data\pg_hba.conf' -Raw; $c = $c -replace '127\.0\.0\.1/32\s+trust', '127.0.0.1/32            scram-sha-256'; Set-Content 'C:\Program Files\PostgreSQL\18\data\pg_hba.conf' -Value $c -NoNewline"

echo.
echo [4/4] Reloading PostgreSQL configuration...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -p 5433 -c "SELECT pg_reload_conf();"

echo.
echo ====================================================================
echo   SUCCESS! Your PostgreSQL password has been reset to: postgres
echo   Matching your .env configuration!
echo ====================================================================
echo.
echo You can now close this window and run: node test-db.js
echo.
pause




