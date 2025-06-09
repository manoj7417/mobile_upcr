# EAS Build Setup Guide for UPCR Mobile App

This guide will help you set up **EAS Build by Expo** to build Android APKs in the cloud without installing Java or Android SDK locally.

## 🎯 What is EAS Build?

EAS Build is Expo's cloud build service that can build Android APKs and iOS apps in the cloud. It supports:
- ✅ Capacitor apps (your case)
- ✅ React Native apps  
- ✅ Expo apps
- ✅ No local Android SDK/Java required

## 📋 Prerequisites

1. **Expo Account** (free): [Sign up at expo.dev](https://expo.dev)
2. **Your project** (already set up with Capacitor)

## 🚀 Step-by-Step Setup

### Step 1: Install EAS CLI

```bash
npm install -g @expo/cli@latest
npm install -g eas-cli@latest
```

### Step 2: Login to Expo

```bash
npx expo login
```

### Step 3: Create Expo Project

Since your app has TanStack configuration conflicts, create the project manually:

1. **Go to [expo.dev](https://expo.dev)**
2. **Click "Create a project"**
3. **Project name**: `upcr-mobile`
4. **Copy the Project ID** (you'll need this)

### Step 4: Update Configuration

Update your `expo.json` file with your actual project ID:

```json
{
  "name": "UPCR Mobile",
  "slug": "upcr-mobile", 
  "version": "1.0.0",
  "platforms": ["android"],
  "android": {
    "package": "com.example.app"
  },
  "extra": {
    "eas": {
      "projectId": "YOUR_ACTUAL_PROJECT_ID_HERE"
    }
  }
}
```

### Step 5: Build Commands

I've already set up these npm scripts for you:

```bash
# Build debug APK (recommended for testing)
npm run eas:build

# Build preview APK (optimized)
npm run eas:build:preview

# Build production app bundle (for Play Store)
npm run eas:build:production
```

## 🔧 Build Process

### Development Build (Debug APK)

```bash
npm run eas:build
```

This will:
1. 🔄 Run the build hook (`build-hook.js`)
2. 📦 Build your TanStack web app 
3. 🔄 Sync Capacitor assets
4. ☁️ Upload to EAS Build
5. 🏗️ Build Android APK in the cloud
6. 📱 Provide download link

### What Happens During Build

1. **Preparation**: The `build-hook.js` script runs:
   - Builds your web app (`npm run build`)
   - Syncs Capacitor (`npx cap sync android`)
   - Prepares Android project

2. **Cloud Build**: EAS Build:
   - Uploads your project to the cloud
   - Installs Android SDK and Java
   - Compiles your APK
   - Makes it available for download

### Expected Build Time
- **First build**: 5-10 minutes
- **Subsequent builds**: 3-5 minutes

## 📱 Getting Your APK

1. **Build completes**: You'll get a notification and email
2. **Download link**: Available in terminal and on expo.dev
3. **Install on device**: 
   - Download APK to your Android device
   - Enable "Install from Unknown Sources"
   - Tap APK to install

## 🛠️ Troubleshooting

### Build Fails - Project ID Missing
Update `expo.json` with your actual project ID from expo.dev

### Build Fails - Web Assets Missing  
Run locally first to ensure it works:
```bash
npm run mobile:build
```

### Build Fails - Capacitor Issues
Check that android directory exists:
```bash
ls android/  # Should show gradlew, build.gradle, etc.
```

### Build Takes Too Long
- Use `development` profile for faster builds during testing
- `production` builds are slower but optimized

## 💰 Pricing

**Free Tier** includes:
- ✅ **30 minutes/month** of build time
- ✅ **Unlimited projects**
- ✅ **Debug APK downloads**

**Paid Tiers** for heavy usage:
- **$29/month**: 1000 minutes
- **$99/month**: 5000 minutes

## 🎉 Benefits of EAS Build

✅ **No local setup** - No Java/Android SDK needed  
✅ **Fast builds** - Powerful cloud infrastructure  
✅ **Easy sharing** - Direct download links  
✅ **CI/CD ready** - Integrates with GitHub Actions  
✅ **Professional** - Same service used by major apps

## 🔄 Alternative: GitHub Actions (Free)

If you prefer free unlimited builds:

1. **Push code to GitHub**
2. **Set up GitHub Actions workflow**
3. **Builds run on every push**
4. **Download APKs from Actions artifacts**

Would you like me to set up GitHub Actions instead?

## 📞 Support

- **EAS Build Docs**: [docs.expo.dev/build](https://docs.expo.dev/build)
- **Capacitor + EAS**: [capacitorjs.com/docs/guides/ci-cd](https://capacitorjs.com/docs/guides/ci-cd)
- **Discord**: [Expo Community](https://discord.gg/expo)

## 🎯 Quick Start Summary

1. **Create account**: [expo.dev](https://expo.dev)
2. **Login**: `npx expo login`  
3. **Update config**: Add your project ID to `expo.json`
4. **Build**: `npm run eas:build`
5. **Download**: Get APK from build completion email
6. **Install**: Side-load on your Android device

Your UPCR mobile app will be ready in minutes! 🚀 