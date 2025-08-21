#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Starting CLI Test Suite Execution...\n');

function runCommand(command, args = [], cwd = __dirname) {
    return new Promise((resolve, reject) => {
        console.log(`📋 Executing: ${command} ${args.join(' ')}`);
        const child = spawn(command, args, { 
            cwd, 
            stdio: 'inherit',
            shell: true
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ Command completed successfully\n`);
                resolve(code);
            } else {
                console.log(`❌ Command failed with exit code ${code}\n`);
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });
        
        child.on('error', (error) => {
            console.error(`❌ Error executing command: ${error.message}`);
            reject(error);
        });
    });
}

async function runTests() {
    const cliDir = __dirname;
    
    try {
        console.log('🔧 Step 1: Installing Dependencies');
        await runCommand('npm', ['install'], cliDir);
        
        console.log('🏗️  Step 2: Building TypeScript');
        await runCommand('npm', ['run', 'build'], cliDir);
        
        console.log('🧪 Step 3: Running Unit Tests');
        await runCommand('npm', ['run', 'test:unit'], cliDir);
        
        console.log('🧪 Step 4: Running Integration Tests');
        await runCommand('npm', ['run', 'test:integration'], cliDir);
        
        console.log('📊 Step 5: Generating Coverage Report');
        await runCommand('npm', ['run', 'test:coverage'], cliDir);
        
        console.log('🔍 Step 6: Running Linting');
        await runCommand('npm', ['run', 'lint'], cliDir);
        
        console.log('🎉 All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
        process.exit(1);
    }
}

runTests();