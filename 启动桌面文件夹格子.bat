@echo off
chcp 65001 >nul
cd /d "%~dp0"
start "" ".\node_modules\electron\dist\electron.exe" .
exit
