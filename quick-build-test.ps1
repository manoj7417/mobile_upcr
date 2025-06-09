# Quick Build Test Script
# Tests if your system is ready to build Android APKs

Write-Host "Testing if your system is ready to build Android APKs..." -ForegroundColor Green

# Test 1: Java
Write-Host "`n1. Testing Java installation..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1
    Write-Host "Java is installed: $($javaVersion[0])" -ForegroundColor Green
    $javaOk = $true
} catch {
    Write-Host "Java not found. Please install JDK 17+" -ForegroundColor Red
    Write-Host "   Download from: https://adoptium.net/" -ForegroundColor Cyan
    $javaOk = $false
}

# Test 2: Node.js and npm
Write-Host "`n2. Testing Node.js and npm..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "Node.js: $nodeVersion, npm: $npmVersion" -ForegroundColor Green
    $nodeOk = $true
} catch {
    Write-Host "Node.js/npm not found" -ForegroundColor Red
    $nodeOk = $false
}

# Test 3: Android project
Write-Host "`n3. Testing Android project..." -ForegroundColor Yellow
if (Test-Path "android") {
    Write-Host "Android project exists" -ForegroundColor Green
    $androidOk = $true
} else {
    Write-Host "Android project not found" -ForegroundColor Red
    $androidOk = $false
}

# Test 4: Web build output
Write-Host "`n4. Testing web build output..." -ForegroundColor Yellow
if (Test-Path ".output/public/index.html") {
    Write-Host "Web build output exists" -ForegroundColor Green
    $webOk = $true
} else {
    Write-Host "Web build output not found. Run 'npm run build' first" -ForegroundColor Red
    $webOk = $false
}

# Summary
Write-Host "`nSummary:" -ForegroundColor Cyan
Write-Host "Java:    $(if($javaOk){'OK'}else{'MISSING'})" -ForegroundColor $(if($javaOk){'Green'}else{'Red'})
Write-Host "Node.js: $(if($nodeOk){'OK'}else{'MISSING'})" -ForegroundColor $(if($nodeOk){'Green'}else{'Red'})
Write-Host "Android: $(if($androidOk){'OK'}else{'MISSING'})" -ForegroundColor $(if($androidOk){'Green'}else{'Red'})
Write-Host "Web:     $(if($webOk){'OK'}else{'MISSING'})" -ForegroundColor $(if($webOk){'Green'}else{'Red'})

if ($javaOk -and $nodeOk -and $androidOk -and $webOk) {
    Write-Host "`nAll prerequisites met! You can build your APK." -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run: npm run mobile:build" -ForegroundColor White
    Write-Host "2. Run: cd android; .\gradlew assembleDebug" -ForegroundColor White
    Write-Host "3. Find APK at: android/app/build/outputs/apk/debug/app-debug.apk" -ForegroundColor White
} else {
    Write-Host "`nSome prerequisites are missing. Please install:" -ForegroundColor Yellow
    if (-not $javaOk) { Write-Host "- Java JDK 17+ from https://adoptium.net/" -ForegroundColor White }
    if (-not $nodeOk) { Write-Host "- Node.js from https://nodejs.org/" -ForegroundColor White }
    if (-not $androidOk) { Write-Host "- Run: npm run mobile:add-android" -ForegroundColor White }
    if (-not $webOk) { Write-Host "- Run: npm run build" -ForegroundColor White }
} 