@echo off
title PostgreSQL Console - robotics_attendance
color 0B
echo ====================================================================
echo   Connected to PostgreSQL Database: robotics_attendance
echo   Port: 5433 ^| User: postgres
echo ====================================================================
echo.
echo Helpful PostgreSQL Commands:
echo   \dt                             - List all tables
echo   SELECT * FROM students;         - View all student records
echo   SELECT * FROM attendance_logs;  - View attendance logs
echo   \d students                     - View columns of students table
echo   \q                              - Exit / Quit
echo ====================================================================
echo.
set PGPASSWORD=postgres
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -p 5433 -U postgres -d robotics_attendance
