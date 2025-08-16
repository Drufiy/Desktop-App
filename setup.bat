@echo off
echo Setting up Drufiy Desktop App...
echo.

echo Cleaning previous installations...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist .next rmdir /s /q .next

echo Installing dependencies...
npm install

echo Setup complete!
echo.
echo To start the app:
echo   npm run electron-dev
echo.
pause