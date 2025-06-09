# Android SDK Setup Script for Windows
# Run this script as Administrator

Write-Host "Setting up Android SDK for UPCR Mobile App..." -ForegroundColor Green

# Check if Java is installed
Write-Host "Checking Java installation..." -ForegroundColor Yellow
try {
    $javaVersion = java -version 2>&1
    Write-Host "Java is installed: $($javaVersion[0])" -ForegroundColor Green
} catch {
    Write-Host "Java not found. Please install JDK 17+ first." -ForegroundColor Red
    Write-Host "Download from: https://adoptium.net/" -ForegroundColor Cyan
    exit 1
}

# Create Android SDK directory
$androidSdkPath = "C:\android-sdk"
Write-Host "Creating Android SDK directory at $androidSdkPath..." -ForegroundColor Yellow

if (!(Test-Path $androidSdkPath)) {
    New-Item -ItemType Directory -Force -Path $androidSdkPath
    Write-Host "Created $androidSdkPath" -ForegroundColor Green
} else {
    Write-Host "$androidSdkPath already exists" -ForegroundColor Green
}

# Set environment variables
Write-Host "Setting environment variables..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidSdkPath, "User")
[Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $androidSdkPath, "User")

$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
$newPathItems = @(
    "$androidSdkPath\cmdline-tools\latest\bin",
    "$androidSdkPath\platform-tools",
    "$androidSdkPath\build-tools\33.0.2"
)

foreach ($item in $newPathItems) {
    if ($currentPath -notlike "*$item*") {
        $currentPath += ";$item"
    }
}

[Environment]::SetEnvironmentVariable("PATH", $currentPath, "User")
Write-Host "Environment variables set" -ForegroundColor Green

# Download command line tools
$cmdlineToolsPath = "$androidSdkPath\cmdline-tools"
$latestPath = "$cmdlineToolsPath\latest"

if (!(Test-Path $latestPath)) {
    Write-Host "Android Command Line Tools need to be downloaded manually..." -ForegroundColor Yellow
    Write-Host "1. Go to: https://developer.android.com/studio#command-tools" -ForegroundColor Cyan
    Write-Host "2. Download 'commandlinetools-win-*_latest.zip'" -ForegroundColor Cyan
    Write-Host "3. Extract to: $latestPath" -ForegroundColor Cyan
    Write-Host "4. Run this script again to continue setup" -ForegroundColor Cyan
    
    # Open the download page
    Start-Process "https://developer.android.com/studio#command-tools"
    
    Read-Host "Press Enter after downloading and extracting the command line tools..."
}

# Check if sdkmanager is available
Write-Host "Checking if SDK Manager is available..." -ForegroundColor Yellow
$env:ANDROID_HOME = $androidSdkPath
$env:PATH = "$env:PATH;$androidSdkPath\cmdline-tools\latest\bin"

try {
    $sdkmanagerPath = "$latestPath\bin\sdkmanager.bat"
    if (Test-Path $sdkmanagerPath) {
        Write-Host "SDK Manager found" -ForegroundColor Green
        
        # Install required SDK components
        Write-Host "Installing Android SDK components..." -ForegroundColor Yellow
        & "$sdkmanagerPath" "platform-tools" "platforms;android-33" "build-tools;33.0.2"
        
        Write-Host "Accepting SDK licenses..." -ForegroundColor Yellow
        "y" | & "$sdkmanagerPath" --licenses
        
        Write-Host "Android SDK setup complete!" -ForegroundColor Green
    } else {
        Write-Host "SDK Manager not found at expected location" -ForegroundColor Red
        Write-Host "Please ensure command line tools are extracted to: $latestPath" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Error running SDK Manager: $_" -ForegroundColor Red
}

Write-Host "`nSetup complete! You can now build Android APKs." -ForegroundColor Green
Write-Host "Run 'npm run mobile:build' to build your mobile app." -ForegroundColor Cyan
Write-Host "Then 'cd android && gradlew assembleDebug' to create APK." -ForegroundColor Cyan

Write-Host "`nNote: You may need to restart your terminal for PATH changes to take effect." -ForegroundColor Yellow 