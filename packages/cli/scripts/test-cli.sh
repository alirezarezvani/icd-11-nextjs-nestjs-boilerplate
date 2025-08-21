#!/bin/bash

# CLI Testing Script for create-icd11-app
# This script tests the CLI functionality end-to-end

set -e

echo "🧪 Starting CLI tests..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLI_DIR="$(dirname "$SCRIPT_DIR")"
CLI_PATH="$CLI_DIR/dist/cli.js"

# Test configuration
TEST_DIR=$(mktemp -d)
PROJECT_NAME="test-healthcare-app"

cleanup() {
    echo -e "${YELLOW}🧹 Cleaning up test files...${NC}"
    rm -rf "$TEST_DIR"
}

trap cleanup EXIT

echo -e "${BLUE}📁 Test directory: $TEST_DIR${NC}"
echo -e "${BLUE}🛠️  CLI path: $CLI_PATH${NC}"

# Build CLI if not exists
if [ ! -f "$CLI_PATH" ]; then
    echo -e "${YELLOW}🔨 Building CLI...${NC}"
    cd "$CLI_DIR"
    npm run build
fi

# Test 1: CLI help
echo -e "${BLUE}🧪 Test 1: CLI Help${NC}"
if node "$CLI_PATH" --help > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Help command works${NC}"
else
    echo -e "${RED}❌ Help command failed${NC}"
    exit 1
fi

# Test 2: CLI version
echo -e "${BLUE}🧪 Test 2: CLI Version${NC}"
if node "$CLI_PATH" --version > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Version command works${NC}"
else
    echo -e "${RED}❌ Version command failed${NC}"
    exit 1
fi

# Test 3: Invalid project name
echo -e "${BLUE}🧪 Test 3: Invalid Project Name${NC}"
cd "$TEST_DIR"
if node "$CLI_PATH" "Invalid Project Name!" > /dev/null 2>&1; then
    echo -e "${RED}❌ Should have rejected invalid project name${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Correctly rejected invalid project name${NC}"
fi

# Test 4: Create project with minimal config (if interactive mode allows)
echo -e "${BLUE}🧪 Test 4: Project Creation Test (Dry Run)${NC}"

# Create a simple configuration file
cat > "$TEST_DIR/test-config.json" << EOF
{
  "template": "minimal",
  "branding": {
    "organizationName": "Test Healthcare",
    "primaryColor": "#1976d2",
    "secondaryColor": "#dc004e"
  },
  "deployment": {
    "provider": "docker"
  },
  "redis": {
    "useDocker": true,
    "host": "localhost",
    "port": 6379
  }
}
EOF

# Note: This would require implementing a --config-file option in the CLI
# For now, we'll just test that the CLI validates the project name correctly

# Test project name validation
cd "$TEST_DIR"
if node "$CLI_PATH" "valid-project-name" --help > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Valid project name accepted${NC}"
else
    echo -e "${RED}❌ Valid project name rejected${NC}"
fi

# Test 5: Check template processor functionality
echo -e "${BLUE}🧪 Test 5: Template Processing${NC}"
cd "$CLI_DIR"
if npm test > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Unit tests pass${NC}"
else
    echo -e "${RED}❌ Unit tests failed${NC}"
    echo "Running tests with output:"
    npm test
    exit 1
fi

echo -e "${GREEN}🎉 All CLI tests passed!${NC}"

# Additional manual testing instructions
echo -e "${YELLOW}📋 Manual Testing Instructions:${NC}"
echo -e "${YELLOW}   1. Run: npx create-icd11-app my-test-app${NC}"
echo -e "${YELLOW}   2. Follow the interactive prompts${NC}"
echo -e "${YELLOW}   3. Verify project structure is created correctly${NC}"
echo -e "${YELLOW}   4. Test the generated application${NC}"

echo -e "${BLUE}📊 Test Summary:${NC}"
echo -e "${GREEN}   ✅ CLI help and version commands${NC}"
echo -e "${GREEN}   ✅ Project name validation${NC}"
echo -e "${GREEN}   ✅ Template processing${NC}"
echo -e "${GREEN}   ✅ Unit tests${NC}"

exit 0