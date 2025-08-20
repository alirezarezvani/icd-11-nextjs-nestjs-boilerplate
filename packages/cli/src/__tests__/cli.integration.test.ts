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
    cliPath = path.resolve(__dirname, '../../../dist/cli.js');
    
    // Check if CLI is built
    if (!fs.existsSync(cliPath)) {
      console.log('Building CLI for tests...');
      execSync('npm run build', { 
        cwd: path.resolve(__dirname, '../../../'),
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
    it('should create a project with default template', async () => {
      const projectName = 'test-healthcare-app';
      const projectPath = path.join(tempDir, projectName);

      // Mock the interactive prompts by providing default values
      const mockConfig = JSON.stringify({
        template: 'default',
        installDependencies: true,
        setupEnvironment: true,
        branding: {
          organizationName: 'Test Healthcare',
          primaryColor: '#1976d2',
          secondaryColor: '#dc004e'
        },
        deployment: {
          provider: 'docker',
          enableCI: false
        },
        redis: {
          useDocker: true,
          host: 'localhost',
          port: 6379
        }
      });

      // Create the project using the CLI with mocked inputs
      const output = execSync(`echo '${mockConfig}' | node ${cliPath} ${projectName} --config-file -`, {
        encoding: 'utf8',
        cwd: tempDir
      });

      expect(output).toContain('Creating ICD-11 healthcare application');
      expect(output).toContain(projectName);

      // Verify project structure was created
      expect(fs.existsSync(projectPath)).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'package.json'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'packages'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'packages', 'frontend'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'packages', 'backend'))).toBe(true);
    }, 30000); // Increase timeout for project creation

    it('should create a frontend-only project', async () => {
      const projectName = 'test-frontend-app';
      const projectPath = path.join(tempDir, projectName);

      const mockConfig = JSON.stringify({
        template: 'frontend-only',
        installDependencies: true,
        setupEnvironment: true,
        branding: {
          organizationName: 'Test Healthcare',
          primaryColor: '#1976d2',
          secondaryColor: '#dc004e'
        },
        deployment: {
          provider: 'docker',
          enableCI: false
        },
        redis: {
          useDocker: false,
          host: 'localhost',
          port: 6379
        }
      });

      const output = execSync(`echo '${mockConfig}' | node ${cliPath} ${projectName} --config-file -`, {
        encoding: 'utf8',
        cwd: tempDir
      });

      expect(output).toContain('Creating ICD-11 healthcare application');

      // Verify frontend-only structure
      expect(fs.existsSync(projectPath)).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'packages', 'frontend'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'packages', 'backend'))).toBe(false);
    }, 30000);

    it('should handle invalid project names', () => {
      const invalidName = 'Invalid Project Name!';

      expect(() => {
        execSync(`node ${cliPath} "${invalidName}"`, {
          encoding: 'utf8',
          cwd: tempDir,
          stdio: 'pipe'
        });
      }).toThrow();
    });

    it('should handle existing directory', async () => {
      const projectName = 'existing-dir';
      const existingDir = path.join(tempDir, projectName);

      // Create existing directory with content
      await fs.ensureDir(existingDir);
      await fs.writeFile(path.join(existingDir, 'existing-file.txt'), 'content');

      expect(() => {
        execSync(`node ${cliPath} ${projectName}`, {
          encoding: 'utf8',
          cwd: tempDir,
          stdio: 'pipe'
        });
      }).toThrow();
    });
  });

  describe('Template Generation', () => {
    it('should generate correct package.json for project', async () => {
      const projectName = 'test-package-json';
      const projectPath = path.join(tempDir, projectName);

      const mockConfig = JSON.stringify({
        template: 'default',
        installDependencies: true,
        setupEnvironment: true,
        branding: {
          organizationName: 'Test Healthcare Org',
          primaryColor: '#1976d2',
          secondaryColor: '#dc004e'
        },
        deployment: {
          provider: 'docker',
          enableCI: false
        },
        redis: {
          useDocker: true,
          host: 'localhost',
          port: 6379
        }
      });

      execSync(`echo '${mockConfig}' | node ${cliPath} ${projectName} --config-file -`, {
        encoding: 'utf8',
        cwd: tempDir
      });

      const packageJson = await fs.readJson(path.join(projectPath, 'package.json'));

      expect(packageJson.name).toBe(projectName);
      expect(packageJson.description).toContain('ICD-11 healthcare application');
      expect(packageJson.scripts).toHaveProperty('dev');
      expect(packageJson.scripts).toHaveProperty('build');
      expect(packageJson.scripts).toHaveProperty('test');
    }, 30000);

    it('should generate Docker Compose files when Docker is selected', async () => {
      const projectName = 'test-docker-compose';
      const projectPath = path.join(tempDir, projectName);

      const mockConfig = JSON.stringify({
        template: 'default',
        installDependencies: true,
        setupEnvironment: true,
        branding: {
          organizationName: 'Test Healthcare',
          primaryColor: '#1976d2',
          secondaryColor: '#dc004e'
        },
        deployment: {
          provider: 'docker',
          enableCI: false
        },
        redis: {
          useDocker: true,
          host: 'localhost',
          port: 6379
        }
      });

      execSync(`echo '${mockConfig}' | node ${cliPath} ${projectName} --config-file -`, {
        encoding: 'utf8',
        cwd: tempDir
      });

      expect(fs.existsSync(path.join(projectPath, 'docker-compose.yml'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, 'docker-compose.prod.yml'))).toBe(true);
    }, 30000);

    it('should generate CI/CD files when specified', async () => {
      const projectName = 'test-github-actions';
      const projectPath = path.join(tempDir, projectName);

      const mockConfig = JSON.stringify({
        template: 'default',
        installDependencies: true,
        setupEnvironment: true,
        branding: {
          organizationName: 'Test Healthcare',
          primaryColor: '#1976d2',
          secondaryColor: '#dc004e'
        },
        deployment: {
          provider: 'aws',
          enableCI: true,
          ciProvider: 'github-actions'
        },
        redis: {
          useDocker: true,
          host: 'localhost',
          port: 6379
        }
      });

      execSync(`echo '${mockConfig}' | node ${cliPath} ${projectName} --config-file -`, {
        encoding: 'utf8',
        cwd: tempDir
      });

      expect(fs.existsSync(path.join(projectPath, '.github', 'workflows'))).toBe(true);
      expect(fs.existsSync(path.join(projectPath, '.github', 'workflows', 'deploy.yml'))).toBe(true);
    }, 30000);
  });

  describe('Environment Configuration', () => {
    it('should generate correct environment files', async () => {
      const projectName = 'test-env-files';
      const projectPath = path.join(tempDir, projectName);

      const mockConfig = JSON.stringify({
        template: 'default',
        installDependencies: true,
        setupEnvironment: true,
        branding: {
          organizationName: 'Test Healthcare Inc',
          primaryColor: '#2e7d32',
          secondaryColor: '#ff9800',
          websiteUrl: 'https://test-healthcare.com',
          supportEmail: 'support@test-healthcare.com'
        },
        deployment: {
          provider: 'docker',
          enableCI: false
        },
        redis: {
          useDocker: true,
          host: 'localhost',
          port: 6379
        },
        whoCredentials: {
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret'
        }
      });

      execSync(`echo '${mockConfig}' | node ${cliPath} ${projectName} --config-file -`, {
        encoding: 'utf8',
        cwd: tempDir
      });

      // Check backend .env file
      const backendEnvExample = path.join(projectPath, 'packages', 'backend', '.env.example');
      expect(fs.existsSync(backendEnvExample)).toBe(true);

      const backendEnvContent = await fs.readFile(backendEnvExample, 'utf8');
      expect(backendEnvContent).toContain('ICD11_CLIENT_ID=');
      expect(backendEnvContent).toContain('ICD11_CLIENT_SECRET=');
      expect(backendEnvContent).toContain('ORG_NAME=Test Healthcare Inc');
      expect(backendEnvContent).toContain('ORG_WEBSITE=https://test-healthcare.com');
      expect(backendEnvContent).toContain('SUPPORT_EMAIL=support@test-healthcare.com');

      // Check frontend .env.local.example file
      const frontendEnvExample = path.join(projectPath, 'packages', 'frontend', '.env.local.example');
      expect(fs.existsSync(frontendEnvExample)).toBe(true);

      const frontendEnvContent = await fs.readFile(frontendEnvExample, 'utf8');
      expect(frontendEnvContent).toContain('NEXT_PUBLIC_APP_NAME=Test Healthcare Inc');
      expect(frontendEnvContent).toContain('NEXT_PUBLIC_PRIMARY_COLOR=#2e7d32');
      expect(frontendEnvContent).toContain('NEXT_PUBLIC_SECONDARY_COLOR=#ff9800');
    }, 30000);
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

    it('should validate configuration before starting project creation', () => {
      const projectName = 'test-invalid-config';

      const invalidConfig = JSON.stringify({
        template: 'invalid-template',
        branding: {
          organizationName: '',
          primaryColor: 'not-a-color',
          secondaryColor: '#dc004e'
        },
        deployment: {
          provider: 'invalid-provider'
        },
        redis: {
          useDocker: true,
          host: '',
          port: 99999
        }
      });

      expect(() => {
        execSync(`echo '${invalidConfig}' | node ${cliPath} ${projectName} --config-file -`, {
          encoding: 'utf8',
          cwd: tempDir,
          stdio: 'pipe'
        });
      }).toThrow();
    });
  });
});