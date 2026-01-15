@echo off
cd /d "C:\Users\tiffa\ProtexxaLearn"

echo Configuring Git Remote...
git remote remove origin 2>nul
git remote add origin https://github.com/Shanae124/protexxalearn.git

echo.
echo Pushing to GitHub...
git push -u origin master

echo.
if %errorlevel% equ 0 (
    echo SUCCESS! Changes pushed to GitHub.
    echo Railway will auto-redeploy in a few moments.
) else (
    echo There was an issue pushing. Please check your GitHub credentials.
)

pause
