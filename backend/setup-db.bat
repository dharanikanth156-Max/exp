@echo off
cd /d C:\Users\dharanikanth\Downloads\farmdirect-marketplace\farmdirect\backend
set PATH=%PATH%;C:\Program Files\MySQL\MySQL Server 9.7\bin

REM Try with no password first
mysql -u root < schema.sql

if errorlevel 1 (
    echo Password required. Trying with password...
    mysql -u root -pdharani < schema.sql
)

if errorlevel 1 (
    echo Both attempts failed. Check MySQL password in .env
) else (
    echo Database initialized successfully!
)
pause
