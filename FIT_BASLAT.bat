@echo off
chcp 65001 >nul
title Fit PWA v0.6.0
cd /d "%~dp0"
echo ==========================================
echo   FIT — Kişisel Spor ve Sağlık Asistanı
echo ==========================================
echo.
echo Uygulama sunucusu başlatılıyor...
echo Tarayıcınız otomatik olarak açılacaktır.
echo.
echo Kapatmak için bu pencereyi kapatabilir veya Ctrl+C yapabilirsiniz.
echo.
npm run dev
pause
