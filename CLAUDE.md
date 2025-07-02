# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Documentation Rules

- **README.md**: English documentation (main readme)
- **README.ja.md**: Japanese documentation (日本語版)
- Always maintain this language separation

## Project Overview

This is a CLI tool that detects and fixes "AI-like" expressions in Japanese text using textlint. The tool is designed specifically for incremental improvement workflows with Claude Code and other AI tools.

## Core Architecture

TypeScript-based CLI tool with src/dist build structure. The main CLI script wraps textlint functionality with two key modes:

1. **Default mode**: Reports issues found in text (human-readable format)
2. **--json mode**: Outputs structured JSON for AI integration

### Key Components

- **src/ai-fix.ts**: Main CLI source code written in TypeScript with proper type definitions
- **dist/ai-fix.js**: Compiled JavaScript output (ESM) from TypeScript build
- **src/default-config.ts**: Built-in default configuration for AI-writing detection when no .textlintrc exists
- **.textlintrc**: Optional configuration file for customizing rules (tool works without it)
- **test/fixtures/**: Contains `ai-like.md` (with AI expressions) and `clean.md` (without issues) for testing
- **tsconfig.json**: TypeScript configuration with ESM output targeting ES2022
- **biome.json**: Biome configuration for formatting and linting (indentWidth: 2, lineWidth: 80)
- **.github/workflows/ci.yml**: GitHub Actions CI/CD pipeline for automated testing

### Exit Codes
- `0`: No issues found
- `1`: Issues found (manual intervention needed)

## Development Commands

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Run in development mode (TypeScript directly)
npm run dev test.md --json

# Code Quality
npm run format        # Format code with Biome
npm run format:check  # Check formatting (CI-friendly)
npm run lint          # Run Biome linter
npm run lint:fix      # Run linter with auto-fix
npm run check         # Run both formatting and linting
npm run check:fix     # Run both with auto-fix

# Run tests
npm test

# Run tests in CI mode (single run)
npm run test:ci

# Test the built CLI
npx . <file> [--json]

# Test with sample files
npx . test/fixtures/ai-like.md --json
npx . test/fixtures/clean.md
```

## Testing Architecture

Uses Vitest with TypeScript support for testing. Tests are written in TypeScript (`ai-fix.test.ts`) and use child process testing via `spawn()` to test the CLI as an external process. Tests cover:
- Both CLI modes (default, --json)
- Exit codes for clean vs problematic files
- JSON report structure validation
- Error handling for missing files

Test helper `runCLI()` function captures stdout, stderr, and exit codes from spawned processes. TypeScript provides proper type safety for test data structures.

## Key Implementation Details

### Textlint Integration
The CLI uses a dual approach: `lintFiles()` to get all messages (since AI-writing rules don't provide fixes) and `fixFiles()` for future compatibility. The `lintResult.messages` array is used for all reporting since `fixResult` doesn't include non-fixable messages.

### Default Configuration
When no `.textlintrc` file exists, the tool automatically uses built-in AI-writing detection rules by creating a temporary configuration file. This ensures the tool works immediately without any setup.

### JSON Report Format
The `--json` mode outputs structured JSON with `before` text and `after: null` (indicating no automatic fix available), designed for Claude Code to process and manually fix the identified issues.

### TypeScript Configuration
Project uses TypeScript with ESM output. The `tsconfig.json` is configured to:
- Target ES2022 with ESNext modules
- Output to `dist/` directory from `src/` source
- Generate declaration files for type definitions
- Use strict type checking

Build process compiles TypeScript to JavaScript, maintaining ESM format with `"type": "module"` in package.json.

### Code Quality Tools
The project uses Biome for formatting and linting:
- **Formatting**: 2-space indentation, 80-character line width, single quotes
- **Linting**: TypeScript-aware rules with automatic fixes available
- **Organization**: Import sorting and unused import removal

### CI/CD Pipeline
GitHub Actions workflow (`.github/workflows/ci.yml`) runs on:
- Push to main branch
- Pull requests to main branch
- Manual dispatch

Pipeline includes:
1. Matrix testing across Node.js 18, 20, 22
2. Code formatting validation (`npm run format:check`)
3. Linting validation (`npm run lint`)
4. TypeScript compilation (`npm run build`)
5. Test execution (`npm run test:ci`)
6. CLI functional testing with exit code validation

## Claude Code Integration

This tool is designed for incremental improvement workflows:
1. Claude generates content → `draft.md`
2. Run `npx ai-writing-fix-cli draft.md --json > report.json`
3. Claude processes report.json and fixes identified issues
4. Repeat until exit code 0

The JSON report provides line/column locations and rule IDs for precise issue identification and fixing.