@echo off
REM Weather App Jenkins CI/CD Setup and Deployment Script
REM This script sets up Jenkins and configures the weather app pipeline

echo ============================================
echo    🌤️ WEATHER APP - JENKINS CI/CD SETUP
echo ============================================
echo.

echo 📋 This script will:
echo    1. Start Jenkins in Docker
echo    2. Configure the weather app pipeline
echo    3. Set up automated deployment
echo.

echo 🚀 Starting Jenkins...
call setup-cicd.bat

echo.
echo 🔧 Jenkins Configuration Steps:
echo ================================
echo.
echo 1. 🌐 Open browser: http://localhost:8080
echo 2. 👤 Login with: admin / admin123
echo 3. ➕ Create New Item → "weather-app-cicd"
echo 4. 📝 Select "Pipeline"
echo 5. 🔗 Configure SCM:
echo    - Repository URL: https://github.com/ShaikMukhtarBasha/cicd_weatherApp.git
echo    - Branch: */main
echo    - Script Path: Frontend/Jenkinsfile.docker
echo 6. 💾 Save and Build Now
echo.

echo 📦 Pipeline Features:
echo ====================
echo • 🏗️  Automated Docker builds
echo • 🧪 Health checks and testing
echo • 📤 Push to GitHub Container Registry
echo • 🚀 Production deployment
echo • 🧹 Automatic cleanup
echo.

echo 🌐 After successful build:
echo =========================
echo • Frontend: http://localhost:3000
echo • Jenkins: http://localhost:8080
echo.

echo ✅ Setup complete! Press any key to exit...
pause > nul