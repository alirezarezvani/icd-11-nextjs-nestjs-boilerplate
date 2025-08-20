# Contributing to create-icd11-app

Thank you for your interest in contributing to create-icd11-app! This guide will help you get started with developing and testing the CLI tool.

## Development Setup

### Prerequisites
- Node.js 16 or higher
- npm 7 or higher
- Git

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd icd11-nextjs-nestjs-boilerplate
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd packages/cli
   npm install
   ```

3. **Build the CLI**
   ```bash
   npm run build
   ```

4. **Test the CLI locally**
   ```bash
   # Link the CLI globally for testing
   npm link
   
   # Test the CLI
   create-icd11-app --help
   ```

## Project Structure

```
packages/cli/
├── src/
│   ├── commands/           # CLI command implementations
│   │   └── create.ts       # Main create command
│   ├── utils/              # Utility functions
│   │   ├── validation.ts   # Input validation
│   │   └── template-processor.ts # Template processing
│   ├── __tests__/          # Test files
│   ├── cli.ts              # CLI entry point
│   └── index.ts            # Export definitions
├── templates/              # Project templates
│   ├── deployment/         # Cloud deployment templates
│   ├── ci-cd/             # CI/CD pipeline templates
│   └── README.md          # Template documentation
├── scripts/               # Development scripts
│   └── test-cli.sh        # CLI testing script
└── package.json           # Package configuration
```

## Development Workflow

### 1. Making Changes

- **Code Style**: Follow TypeScript best practices
- **Commits**: Use conventional commit messages
- **Testing**: Add tests for new functionality
- **Documentation**: Update README and comments

### 2. Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Run the CLI test script
./scripts/test-cli.sh
```

### 3. Building and Testing Locally

```bash
# Build the CLI
npm run build

# Test with a real project creation
cd /tmp
node /path/to/cli/dist/cli.js test-project

# Follow the interactive prompts
# Verify the generated project works correctly
```

## Adding New Features

### Adding a New Template

1. **Create template directory**
   ```bash
   mkdir -p templates/your-new-template
   ```

2. **Add template files**
   - Use Handlebars-style variables: `{{VARIABLE_NAME}}`
   - Use conditionals: `{{#if_condition}}...{{/if_condition}}`

3. **Update template processor**
   - Add new template configuration in `src/utils/template-processor.ts`
   - Add any new conditional logic

4. **Add tests**
   - Unit tests for template processing
   - Integration tests for project generation

### Adding New CLI Options

1. **Update command definition** in `src/commands/create.ts`
2. **Add validation** in `src/utils/validation.ts`
3. **Update template processor** to handle new options
4. **Add tests** for the new functionality
5. **Update documentation** in README.md

### Adding New Cloud Provider Support

1. **Create deployment templates** in `templates/deployment/provider-name/`
2. **Add provider validation** in validation utilities
3. **Update template processor** for new provider conditionals
4. **Add CI/CD templates** if applicable
5. **Test deployment** with the new provider
6. **Update documentation**

## Template System

### Variables

Templates support these variables:

- `{{PROJECT_NAME}}` - Project name
- `{{ORGANIZATION_NAME}}` - Healthcare organization name
- `{{PRIMARY_COLOR}}` - Primary brand color
- `{{SECONDARY_COLOR}}` - Secondary brand color
- `{{ORG_WEBSITE}}` - Organization website URL
- `{{SUPPORT_EMAIL}}` - Support contact email
- `{{DEPLOYMENT_PROVIDER}}` - Selected deployment provider
- `{{REDIS_HOST}}` - Redis server host
- `{{REDIS_PORT}}` - Redis server port

### Conditionals

Templates support conditional blocks:

- `{{#if_includes_frontend}}...{{/if_includes_frontend}}`
- `{{#if_includes_backend}}...{{/if_includes_backend}}`
- `{{#if_includes_redis}}...{{/if_includes_redis}}`
- `{{#if_deployment_aws}}...{{/if_deployment_aws}}`
- `{{#if_who_credentials}}...{{/if_who_credentials}}`

### Example Template

```yaml
# {{ORGANIZATION_NAME}} Configuration
app_name: {{PROJECT_NAME}}
organization: {{ORGANIZATION_NAME}}

{{#if_includes_redis}}
redis:
  host: {{REDIS_HOST}}
  port: {{REDIS_PORT}}
{{/if_includes_redis}}

{{#if_deployment_aws}}
deployment:
  provider: aws
  region: us-east-1
{{/if_deployment_aws}}
```

## Testing Guidelines

### Unit Tests

- Test individual functions and classes
- Mock external dependencies
- Focus on edge cases and error handling
- Achieve good code coverage

### Integration Tests

- Test CLI commands end-to-end
- Use temporary directories for file operations
- Test different configuration combinations
- Verify generated project structure

### Manual Testing

1. **Test all template types**
   - Default (full-stack)
   - Frontend-only
   - API-only
   - Minimal

2. **Test all deployment providers**
   - Docker
   - AWS
   - Azure
   - Google Cloud

3. **Test edge cases**
   - Invalid project names
   - Existing directories
   - Network failures
   - Invalid configurations

## Code Review Process

### Before Submitting

- [ ] Code builds without errors
- [ ] All tests pass
- [ ] New functionality is tested
- [ ] Documentation is updated
- [ ] Code follows project style

### Pull Request Checklist

- [ ] Clear description of changes
- [ ] Tests included for new features
- [ ] Documentation updated
- [ ] Breaking changes documented
- [ ] CLI tested manually

## Release Process

### Version Updates

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create Git tag
4. Publish to npm

### Testing Release

```bash
# Build and pack
npm run build
npm pack

# Test the package
npm install -g create-icd11-app-1.0.0.tgz
create-icd11-app test-app

# Cleanup
npm uninstall -g create-icd11-app
```

## Common Issues

### Template Processing

- **Issue**: Variables not replaced in templates
- **Solution**: Check variable names match exactly, including case

### File Permissions

- **Issue**: Generated files have incorrect permissions
- **Solution**: Use `fs.chmod()` to set appropriate permissions

### Path Handling

- **Issue**: Paths not working on different operating systems
- **Solution**: Use `path.join()` and `path.resolve()` consistently

### Large Projects

- **Issue**: CLI times out for large projects
- **Solution**: Implement progress indicators and optimize file operations

## Architecture Decisions

### Why TypeScript?

- Type safety for configuration objects
- Better IDE support for development
- Easier refactoring and maintenance

### Why Handlebars-style Templates?

- Simple syntax for non-developers
- Powerful conditional logic
- Widely understood format

### Why Inquirer.js?

- Rich interactive prompts
- Good user experience
- Validation support

### Why Commander.js?

- Standard CLI framework for Node.js
- Good documentation and community
- Flexible command structure

## Getting Help

- **Documentation**: Check README.md and inline comments
- **Issues**: Search existing GitHub issues
- **Discussions**: Use GitHub discussions for questions
- **Contributing**: This file for development guidance

## Resources

- [Node.js CLI Best Practices](https://github.com/lirantal/nodejs-cli-apps-best-practices)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Inquirer.js Documentation](https://github.com/SBoudrias/Inquirer.js)
- [Commander.js Documentation](https://github.com/tj/commander.js)

Thank you for contributing to create-icd11-app! 🏥💻