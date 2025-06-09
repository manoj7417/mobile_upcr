#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔧 Running Capacitor build preparation...');

try {
    // Build the web application
    console.log('📦 Building web application...');
    execSync('npm run build', { stdio: 'inherit' });

    // Ensure index.html exists for Capacitor
    const indexPath = '.output/public/index.html';
    if (!fs.existsSync(indexPath)) {
        console.log('📄 Creating index.html for Capacitor...');
        const indexContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UPCR Mobile</title>
    <link rel="stylesheet" href="/_build/assets/client.css">
</head>
<body>
    <div id="root">
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh;">
            Loading...
        </div>
    </div>
    <script type="module" src="/_build/assets/client.js"></script>
</body>
</html>`;
        fs.writeFileSync(indexPath, indexContent);
    }

    // Sync Capacitor
    console.log('🔄 Syncing Capacitor...');
    execSync('npx cap sync android', { stdio: 'inherit' });

    // Ensure the android directory exists
    if (!fs.existsSync('android')) {
        console.log('📱 Adding Android platform...');
        execSync('npx cap add android', { stdio: 'inherit' });
    }

    // Copy any additional assets if needed
    console.log('📋 Preparing build assets...');

    // Make sure gradlew is executable (for Unix systems)
    const gradlewPath = path.join('android', 'gradlew');
    if (fs.existsSync(gradlewPath)) {
        try {
            fs.chmodSync(gradlewPath, '755');
        } catch (err) {
            console.log('Note: Could not set gradlew permissions (this is fine on Windows)');
        }
    }

    console.log('✅ Capacitor build preparation completed!');

} catch (error) {
    console.error('❌ Build preparation failed:', error.message);
    process.exit(1);
} 