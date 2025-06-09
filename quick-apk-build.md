# Quick APK Build - Alternative Methods

Since EAS Build is having Gradle issues, here are alternative ways to get your UPCR mobile APK:

## 🏗️ Method 1: GitHub Actions (Free & Reliable)

### Setup GitHub Actions Build

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add mobile app build"
   git push origin main
   ```

2. **Create `.github/workflows/build.yml`**:
   ```yaml
   name: Build Android APK
   
   on:
     push:
       branches: [ main ]
     workflow_dispatch:
   
   jobs:
     build:
       runs-on: ubuntu-latest
       
       steps:
       - uses: actions/checkout@v3
       
       - name: Setup Node.js
         uses: actions/setup-node@v3
         with:
           node-version: '20'
           cache: 'npm'
       
       - name: Setup Java
         uses: actions/setup-java@v3
         with:
           distribution: 'temurin'
           java-version: '17'
       
       - name: Setup Android SDK
         uses: android-actions/setup-android@v2
       
       - name: Install dependencies
         run: npm install
       
       - name: Build web app
         run: npm run build
       
       - name: Setup Capacitor
         run: |
           npm install -g @capacitor/cli
           npx cap add android || true
           npx cap sync android
       
       - name: Build APK
         run: |
           cd android
           chmod +x gradlew
           ./gradlew assembleDebug
       
       - name: Upload APK
         uses: actions/upload-artifact@v3
         with:
           name: upcr-mobile-debug.apk
           path: android/app/build/outputs/apk/debug/app-debug.apk
   ```

3. **Trigger Build**: Push to GitHub or click "Actions" → "Run workflow"
4. **Download APK**: From Actions artifacts after build completes

## 🛠️ Method 2: Fix EAS Build Issues

The Gradle error suggests missing dependencies. Try this fix:

### Update EAS Build Configuration

1. **Add build dependencies** to `eas.json`:
   ```json
   {
     "build": {
       "development": {
         "distribution": "internal",
         "env": {
           "NODE_ENV": "development"
         },
         "android": {
           "buildType": "apk",
           "gradleCommand": ":app:assembleDebug"
         }
       }
     }
   }
   ```

2. **Simplify Android build** by updating `android/app/build.gradle`:
   ```gradle
   android {
       compileSdkVersion 33
       defaultConfig {
           minSdkVersion 22
           targetSdkVersion 33
       }
   }
   ```

3. **Try build again**:
   ```bash
   eas build --platform android --profile development
   ```

## ⚡ Method 3: Capacitor Live Deploy

For quick testing without building:

1. **Run development server**:
   ```bash
   npm run dev
   ```

2. **Use Capacitor Live Reload**:
   ```bash
   npx cap run android --livereload --external
   ```

This will open your app in an Android emulator or connected device with live updates.

## 🔧 Method 4: Manual APK Build (If you install Java)

If you install Java JDK 17+:

1. **Install Java**: Download from [adoptium.net](https://adoptium.net/)
2. **Build locally**:
   ```bash
   npm run mobile:build
   cd android
   .\gradlew assembleDebug
   ```
3. **Get APK**: `android/app/build/outputs/apk/debug/app-debug.apk`

## 🎯 Recommended: GitHub Actions

**GitHub Actions is the most reliable option** because:
- ✅ **Free unlimited builds** for public repos
- ✅ **No local setup required**
- ✅ **Stable Android SDK environment**
- ✅ **Easy APK download**
- ✅ **Works every time**

## 🚀 Quick Test

Want to test immediately? Use **Expo Snack**:
1. Go to [snack.expo.dev](https://snack.expo.dev)
2. Upload your built web files
3. Test on device instantly via QR code

Your mobile app is ready - just need to choose the build method that works best for you! 