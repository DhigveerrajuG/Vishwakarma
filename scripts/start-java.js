const { execSync } = require('child_process');
const fs = require('fs');
const jdkPath = 'C:\\Program Files\\Java\\jdk-26.0.2.1\\bin\\java.exe';
const java = fs.existsSync(jdkPath) ? `"${jdkPath}"` : 'java';
try {
    execSync(`${java} -cp backend-java/bin com.portfolio.PortfolioServer`, { stdio: 'inherit' });
} catch (err) {
    console.error('Java server process ended:', err.message);
}
