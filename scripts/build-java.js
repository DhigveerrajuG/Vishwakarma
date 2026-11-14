const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const jdkPath = 'C:\\Program Files\\Java\\jdk-26.0.2.1\\bin\\javac.exe';
const javac = fs.existsSync(jdkPath) ? `"${jdkPath}"` : 'javac';
try {
    if (!fs.existsSync('backend-java/bin')) {
        fs.mkdirSync('backend-java/bin', { recursive: true });
    }
    execSync(`${javac} -d backend-java/bin backend-java/src/main/java/com/portfolio/PortfolioServer.java`, { stdio: 'inherit' });
    console.log('✅ Java Backend compiled successfully to backend-java/bin');
} catch (err) {
    console.error('❌ Failed to compile Java backend:', err.message);
    process.exit(1);
}
