# EAS Build Script - Handles TanStack config conflicts
# This script temporarily moves app.config.ts during EAS build

Write-Host "Starting EAS Build for UPCR Mobile..." -ForegroundColor Green

# Backup TanStack config to avoid conflicts
if (Test-Path "app.config.ts") {
    Write-Host "Backing up TanStack config..." -ForegroundColor Yellow
    Move-Item "app.config.ts" "app.config.ts.temp"
}

try {
    # Run EAS build
    Write-Host "Running EAS Build..." -ForegroundColor Cyan
    eas build --platform android --profile development
    
    Write-Host "Build completed!" -ForegroundColor Green
} catch {
    Write-Host "Build failed: $_" -ForegroundColor Red
} finally {
    # Restore TanStack config
    if (Test-Path "app.config.ts.temp") {
        Write-Host "Restoring TanStack config..." -ForegroundColor Yellow
        Move-Item "app.config.ts.temp" "app.config.ts"
    }
}

Write-Host "Done!" -ForegroundColor Green 