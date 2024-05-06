@echo off
SETLOCAL

REM Pfad zur lokalen Node.js und NPM setzen
SET PATH=%~dp0node;%PATH%

REM Gulp Befehle mit lokaler Node.js ausführen
"%~dp0node_modules\.bin\gulp.cmd" %*

ENDLOCAL
