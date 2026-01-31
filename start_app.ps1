Write-Host "Starting ContinuityGuard..." -ForegroundColor Cyan

# Start Backend
Write-Host "Launching Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn main:app --reload"

# Start Frontend
Write-Host "Launching Frontend..." -ForegroundColor Magenta
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "Done! Application should be running." -ForegroundColor Cyan
