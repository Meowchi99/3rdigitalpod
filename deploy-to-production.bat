@echo off
setlocal

cd /d "%~dp0"

echo.
echo ========================================================
echo   3R DIGITAL POD - DEPLOY TO PRODUCTION (v2)
echo ========================================================
echo.
echo Note: Previous push was rejected by GitHub secret scanning
echo because .env.local.example had a real OpenAI API key.
echo The file has been cleaned (placeholders only).
echo This script will amend the commit and push again.
echo.

echo [1/5] Removing git lock file if any...
if exist ".git\index.lock" (
    del /f /q ".git\index.lock"
    echo       - Lock removed
) else (
    echo       - No lock file
)

echo.
echo [2/5] Setting git identity...
git config user.email "wawa.desingn@gmail.com"
git config user.name "Meowchi99"
echo       - Done

echo.
echo [3/5] Staging cleaned files...
git add -A
if errorlevel 1 goto ERROR

echo.
echo [4/5] Amending previous commit (replaces bad commit with clean one)...
git commit --amend --no-edit
if errorlevel 1 (
    echo.
    echo If "nothing to commit" - ok, proceeding to push.
    echo If "no previous commit" - creating new commit.
    git commit -m "feat: single-owner model + sold designs + image uploads"
)

echo.
echo [5/5] Pushing to GitHub (Vercel will auto-deploy)...
git push origin main
if errorlevel 1 goto ERROR

echo.
echo ========================================================
echo   PUSH SUCCESSFUL
echo.
echo   - Vercel is now building and deploying
echo   - Wait 1-2 minutes then check:
echo     https://www.3rdigitallab.digital/owner
echo.
echo   - Deploy status: https://vercel.com/dashboard
echo ========================================================
echo.
pause
exit /b 0

:ERROR
echo.
echo ========================================================
echo   ERROR - See red message abo