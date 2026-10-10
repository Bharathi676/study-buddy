@echo off
title Push Study Buddy to GitHub
color 0B
echo ========================================================
echo   Pushing Study Buddy to GitHub: Bharathi676/study-buddy
echo ========================================================
echo.
echo Step 1: Make sure the repo exists on GitHub.
echo Opening GitHub in your browser with the repository name pre-filled...
start "" "https://github.com/new?name=study-buddy"
echo.
echo In your browser, simply click the green "Create repository" button.
echo (Do not check "Add a README file" as one already exists)
echo.
echo Once you clicked "Create repository", press any key below to push...
pause > nul
echo.
echo Step 2: Uploading codebase to GitHub...
cd /d "%~dp0"
git push -u origin main
echo.
echo ========================================================
if %ERRORLEVEL% equ 0 (
    echo SUCCESS! Repository uploaded successfully!
    echo View it here: https://github.com/Bharathi676/study-buddy
) else (
    echo Push failed. If prompted, please allow GitHub authentication.
)
echo ========================================================
echo Press any key to exit.
pause > nul
