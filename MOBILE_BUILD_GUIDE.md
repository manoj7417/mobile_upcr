# Mobile App Build Guide - Android without Android Studio

This guide will help you build Android APKs for your UPCR app without requiring Android Studio.

## Prerequisites

1. **Java Development Kit (JDK) 17 or higher**
2. **Android SDK Command Line Tools**
3. **Node.js and npm** (already installed)

## Step 1: Install Java JDK

### Windows:
1. Download JDK 17+ from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://adoptium.net/)
2. Install and add to PATH
3. Verify installation:
   ```bash
   java -version
   javac -version
   ```

## Step 2: Install Android SDK Command Line Tools

### Windows:
1. Create Android SDK directory:
   ```bash
   mkdir C:\android-sdk
   cd C:\android-sdk
   ```

2. Download Android Command Line Tools from [Android Developer](https://developer.android.com/studio#command-tools)
   - Download `commandlinetools-win-xxxx_latest.zip`

3. Extract to `C:\android-sdk\cmdline-tools\latest\`

4. Add to PATH in Environment Variables:
   ```
   ANDROID_HOME=C:\android-sdk
   PATH=%PATH%;%ANDROID_HOME%\cmdline-tools\latest\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\build-tools\33.0.2
   ```

5. Install required SDK components:
   ```bash
   sdkmanager "platform-tools" "platforms;android-33" "build-tools;33.0.2"
   sdkmanager --licenses
   ```

## Step 3: Build Commands

### Development Build
```bash
# Build the web app and sync to mobile
npm run mobile:build

# Open Android project in file explorer (optional)
npm run mobile:android
```

### Debug APK Build
```bash
# Navigate to Android directory and build debug APK
cd android
./gradlew assembleDebug

# APK will be created at: android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK Build (for production)
```bash
# Generate signing key (one time only)
keytool -genkey -v -keystore upcr-release-key.keystore -alias upcr -keyalg RSA -keysize 2048 -validity 10000

# Build release APK
cd android
./gradlew assembleRelease

# APK will be created at: android/app/build/outputs/apk/release/app-release.apk
```

## Step 4: Install APK on Device

### Using ADB (Android Debug Bridge):
```bash
# Enable USB Debugging on your Android device
# Connect device via USB

# Install debug APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or install release APK
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Manual Installation:
1. Copy the APK file to your Android device
2. Enable "Install from Unknown Sources" in device settings
3. Tap the APK file to install

## Alternative: Capacitor Cloud Build (Easiest Option)

If you prefer not to set up the Android SDK locally, you can use Capacitor's cloud build service:

1. Sign up at [Ionic AppFlow](https://ionic.io/appflow)
2. Connect your repository
3. Build APKs in the cloud without local setup

## Troubleshooting

### Common Issues:

1. **Gradle build fails**: Ensure Java JDK is properly installed and JAVA_HOME is set
2. **SDK not found**: Verify ANDROID_HOME environment variable
3. **Gradlew permission denied**: Run `chmod +x gradlew` (Linux/Mac) or use `gradlew.bat` (Windows)

### Environment Variables Check:
```bash
echo $ANDROID_HOME
echo $JAVA_HOME
java -version
adb version
```

## Project Structure

```
mobile_upcr/
├── android/                 # Native Android project
├── app/                     # React app source
├── .output/public/          # Built web assets
├── capacitor.config.ts      # Capacitor configuration
└── package.json            # Mobile build scripts
```

## Available Scripts

- `npm run mobile:build` - Build web app and sync to mobile
- `npm run mobile:android` - Open Android project
- `npm run mobile:add-android` - Add Android platform
- `npm run mobile:run-android` - Run on connected device
- `npm run mobile:build-android` - Build APK using Capacitor CLI

## Next Steps

1. Test the debug APK on your device
2. Configure app icons and splash screens in `android/app/src/main/res/`
3. Set up proper signing for release builds
4. Consider publishing to Google Play Store

For more advanced configurations, refer to the [Capacitor Android Documentation](https://capacitorjs.com/docs/android). 