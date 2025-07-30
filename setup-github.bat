@echo off
echo ========================================
echo   ThreeAI 3D Creator - GitHub Setup
echo ========================================
echo.

echo [1/6] Initializing Git repository...
git init

echo.
echo [2/6] Adding all files to Git...
git add .

echo.
echo [3/6] Creating initial commit...
git commit -m "🚀 Initial commit: ThreeAI 3D Creator - Modern web app for creating 3D geometry from natural language"

echo.
echo [4/6] Adding your GitHub repository as remote...
echo Please enter your GitHub repository URL (e.g., https://github.com/username/repo-name.git):
set /p repo_url="Repository URL: "
git remote add origin %repo_url%

echo.
echo [5/6] Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo [6/6] Setting up Vercel deployment...
echo Your project is now on GitHub!
echo Next steps:
echo 1. Go to https://vercel.com
echo 2. Click "New Project"
echo 3. Import from GitHub
echo 4. Select your repository
echo 5. Deploy!
echo.
echo ========================================
echo   ✅ GitHub Setup Complete!
echo ========================================
pause
