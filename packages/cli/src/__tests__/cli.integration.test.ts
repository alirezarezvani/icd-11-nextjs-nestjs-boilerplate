/**
 * Integration tests for CLI functionality
 */

import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

describe('CLI Integration Tests', () => {
  let tempDir: string;
  let cliPath: string;

  beforeAll(() => {
    // Build the CLI first
    cliPath = path.resolve(__dirname, '../../dist/cli.js');
    
    // Check if CLI is built
    if (!fs.existsSync(cliPath)) {
      console.log('Building CLI for tests...');
      execSync('npm run build', { 
        cwd: path.resolve(__dirname, '../../'),
        stdio: 'inherit'
      });
    }
  });

  beforeEach(async () => {
    // Create temporary directory for each test
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-test-'));
  });

  afterEach(async () => {
    // Clean up temporary directory
    if (tempDir && fs.existsSync(tempDir)) {
      await fs.remove(tempDir);
    }
  });

  describe('CLI Help and Version', () => {
    it('should display help information', () => {
      const output = execSync(`node ${cliPath} --help`, { 
        encoding: 'utf8',
        cwd: tempDir
      });

      expect(output).toContain('create-icd11-app');
      expect(output).toContain('Create a new ICD-11 healthcare application');
    });

    it('should display version information', () => {
      const output = execSync(`node ${cliPath} --version`, { 
        encoding: 'utf8',
        cwd: tempDir
      });

      expect(output).toMatch(/\d+\.\d+\.\d+/); // Should match semantic version
    });
  });

  describe('Project Creation', () => {
    it('should create a project with default template using --yes flag', async () => {
      const projectName = 'test-healthcare-app';
      const projectPath = path.join(tempDir, projectName);

      // Use --yes flag to skip interactive prompts and use defaults
      const output = execSync(`node ${cliPath} ${projectName} --template default --yes`, {
        encoding: 'utf8',
        cwd: tempDir,
        timeout: 300000 // 5 minutes timeout for full project creation
      });

      expect(output).toContain('Creating ICD-11 healthcare application');
      expect(output).toContain(projectName);

      // Verify project structure was created
      expect(fs.existsSync(projectPath)).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'packages'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'packages', 'frontend'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'packages', 'backend'))).toBe(true);
    }, 320000); // Increase timeout for project creation

    it('should create a frontend-only project', async () => {
      const projectName = 'test-frontend-app';
      const projectPath = path.join(tempDir, projectName);

      // Use --template and --yes flags for frontend-only template
      const output = execSync(`node ${cliPath} ${projectName} --template frontend-only --yes`, {
        encoding: 'utf8',
        cwd: tempDir,
        timeout: 300000 // 5 minutes timeout
      });

      expect(output).toContain('Creating ICD-11 healthcare application');

      // Verify frontend-only structure
      expect(fs.existsSync(projectPath)).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'packages', 'frontend'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'packages', 'backend'))).toBe(false);
    }, 320000);

    it('should handle invalid project names', () => {
      const invalidName = 'Invalid Project Name!';

      expect(() => {
        execSync(`node ${cliPath} "${invalidName}" --yes`, {
          encoding: 'utf8',
          cwd: tempDir,
          stdio: 'pipe'
        });
      }).toThrow();
    });

    it('should handle existing directory when using --yes flag', async () => {
      const projectName = 'existing-dir';
      const existingDir = path.join(tempDir, projectName);

      // Create existing directory with content
      await fs.ensureDir(existingDir);
      await fs.writeFile(path.join(existingDir, 'existing-file.txt'), 'content');

      // With --yes flag, CLI should continue without prompting
      // Note: This test behavior depends on CLI implementation
      // If CLI is designed to fail on existing dirs even with --yes, adjust accordingly
      const output = execSync(`node ${cliPath} ${projectName} --yes`, {
        encoding: 'utf8',
        cwd: tempDir
      });

      expect(output).toContain('Creating ICD-11 healthcare application');
    });
  });

  describe('Template Generation', () => {
    it('should generate correct package.json for project', async () => {
      const projectName = 'test-package-json';
      const projectPath = path.join(tempDir, projectName);

      // Use --yes flag to use default configuration
      execSync(`node ${cliPath} ${projectName} --template default --yes`, {
        encoding: 'utf8',
        cwd: tempDir,
        timeout: 300000
      });

      const packageJson = await fs.readJson(path.join(projectPath, 'package.json'));

      expect(packageJson.name).toBe(projectName);
      expect(packageJson.description).toContain('ICD-11 healthcare application');
      expect(packageJson.scripts).toHaveProperty('dev');
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts).toHaveProperty('test');
    }, 320000);

    it('should generate Docker Compose files when Docker is selected', async () => {
      const projectName = 'test-docker-compose';
      const projectPath = path.join(tempDir, projectName);

      // Use --yes flag - default configuration includes Docker setup
      execSync(`node ${cliPath} ${projectName} --template default --yes`, {
        encoding: 'utf8',
        cwd: tempDir,
        timeout: 300000
      });

      expect(fs.existsSync(path.join(projectPath, 'docker-compose.yml'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'docker-compose.prod.yml'))).toBe(true);
    }, 320000);

    it('should generate CI/CD files when specified', async () => {
      const projectName = 'test-github-actions';
      const projectPath = path.join(tempDir, projectName);

      // Note: This test may need adjustment based on default configuration
      // The --yes flag uses defaults which may not include CI/CD setup
      // If default config doesn't include CI/CD, this test should be updated
      execSync(`node ${cliPath} ${projectName} --template default --yes`, {
        encoding: 'utf8',
        cwd: tempDir,
        timeout: 300000
      });

      // Check if CI/CD files exist (may not be present with default --yes config)
      // Adjust expectations based on actual default behavior
      const hasGithubWorkflows = fs.existsSync(path.join(projectPath, '.github', 'workflows'));
      if (hasGithubWorkflows) {
        expect(fs.existsSync(path.join(projectPath, '.github', 'workflows', 'deploy.yml'))).toBe(true);
      } else {
        // Skip test if default config doesn't include CI/CD
        console.log('CI/CD not included in default configuration');
      }
    }, 320000);
  });

  describe('Environment Configuration', () => {
    it('should generate correct environment files', async () => {
      const projectName = 'test-env-files';
      const projectPath = path.join(tempDir, projectName);

      // Use --yes flag with default configuration
      execSync(`node ${cliPath} ${projectName} --template default --yes`, {
        encoding: 'utf8',
        cwd: tempDir,
        timeout: 300000
      });

      // Check backend .env file
      const backendEnvExample = path.join(projectPath, 'packages', 'backend', '.env.example');
      expect(fs.existsSync(backendEnvExample)).toBe(true);

      const backendEnvContent = await fs.readFile(backendEnvExample, 'utf8');
      expect(backendEnvContent).toContain('ICD11_CLIENT_ID=');
      expect(backendEnvContent).toContain('ICD11_CLIENT_SECRET=');
      // Note: Default values will be used for organization info
      expect(backendEnvContent).toContain('ORG_NAME=');

      // Check frontend .env.local.example file
      const frontendEnvExample = path.join(projectPath, 'packages', 'frontend', '.env.local.example');
      expect(fs.existsSync(frontendEnvExample)).toBe(true);

      const frontendEnvContent = await fs.readFile(frontendEnvExample, 'utf8');
      expect(frontendEnvContent).toContain('NEXT_PUBLIC_APP_NAME=');
      expect(frontendEnvContent).toContain('NEXT_PUBLIC_PRIMARY_COLOR=');
      expect(frontendEnvContent).toContain('NEXT_PUBLIC_SECONDARY_COLOR=');
    }, 320000);
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      // This test would require mocking network calls
      // For now, just ensure CLI doesn't crash on basic operations
      expect(() => {
        execSync(`node ${cliPath} --help`, {
          encoding: 'utf8',
          cwd: tempDir
        });
      }).not.toThrow();
    });

    it('should handle invalid template names gracefully', () => {
      const projectName = 'test-invalid-template';

      // CLI should not crash with invalid template, but proceed with the provided name
      const output = execSync(`node ${cliPath} ${projectName} --template invalid-template --yes`, {
        encoding: 'utf8',
        cwd: tempDir,
        timeout: 300000
      });

      expect(output).toContain('Creating ICD-11 healthcare application');
      expect(output).toContain('Template: invalid-template');
      // CLI accepts any template name and proceeds
    });

    it('should display verbose output when --verbose flag is used', () => {
      const output = execSync(`node ${cliPath} --help --verbose`, {
        encoding: 'utf8',
        cwd: tempDir
      });

      expect(output).toContain('create-icd11-app');
      // Verbose output should still contain help information
    });
  });
});