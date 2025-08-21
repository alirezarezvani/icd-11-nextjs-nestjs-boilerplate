const { execSync } = require('child_process');
const path = require('path');

const cliDir = __dirname;
console.log('CLI Directory:', cliDir);

try {
    console.log('🧪 Running Jest Tests...');
    
    // Change to CLI directory and run tests
    process.chdir(cliDir);
    
    // Check if jest is available
    const jestPath = path.join(cliDir, 'node_modules', '.bin', 'jest');
    console.log('Jest path:', jestPath);
    
    // Run tests with explicit configuration
    const result = execSync('npx jest --config jest.config.js --verbose --no-cache', {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: cliDir
    });
    
    console.log('✅ Test Output:');
    console.log(result);
    
} catch (error) {
    console.error('❌ Error running tests:');
    console.error('Exit code:', error.status);
    console.error('stdout:', error.stdout?.toString() || 'No stdout');
    console.error('stderr:', error.stderr?.toString() || 'No stderr');
}