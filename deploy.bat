@echo off
echo ========================================
echo   ThreeAI 3D Creator - Deploy to Vercel
echo ========================================
echo.

echo [1/3] Checking if Vercel CLI is installed...
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo Vercel CLI not found. Installing...
    npm install -g vercel
) else (
    echo ✅ Vercel CLI is already installed
)

echo.
echo [2/3] Logging into Vercel...
vercel login

echo.
echo [3/3] Deploying to Vercel...
vercel --prod

echo.
echo ========================================
echo   🚀 Deployment Complete!
echo ========================================
echo Your ThreeAI 3D Creator is now live!
echo.
pause
