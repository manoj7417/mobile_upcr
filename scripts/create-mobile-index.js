import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const outputDir = '.output/public';
const indexPath = join(outputDir, 'index.html');

// Ensure the output directory exists
if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
    console.log('📁 Created output directory:', outputDir);
}

// Create the index.html file for Capacitor
const indexContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <title>UPCR Mobile</title>
    <link rel="stylesheet" href="/_build/assets/client.css">
</head>
<body>
    <div id="root">
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui;">
            <div style="text-align: center;">
                <div style="margin-bottom: 20px; font-size: 24px;">UPCR Mobile</div>
                <div>Loading...</div>
            </div>
        </div>
    </div>
    <script type="module" src="/_build/assets/client.js"></script>
</body>
</html>`;

try {
    writeFileSync(indexPath, indexContent, 'utf8');
    console.log('✅ Successfully created index.html for Capacitor mobile app');
    console.log('📍 Location:', indexPath);
} catch (error) {
    console.error('❌ Failed to create index.html:', error);
    process.exit(1);
} 