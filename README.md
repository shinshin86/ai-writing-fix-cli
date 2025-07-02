# AI-Writing Fix CLI

[![Tests](https://github.com/shinshin86/ai-writing-fix-cli/actions/workflows/test.yml/badge.svg)](https://github.com/shinshin86/ai-writing-fix-cli/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A CLI tool that detects "AI-like" expressions in Japanese text using textlint, providing human-readable reports and JSON output for AI tools.

[日本語 README](./README.ja.md)

## Overview

This CLI tool helps identify and improve AI-generated text patterns in Japanese documents. It uses textlint with specialized rules to detect the following patterns:

- Mechanical list formatting with emojis
- Hyperbolic expressions like "revolutionary" or "world's first"
- Formulaic emphasis patterns
- Verbose, passive, and abstract technical writing

Perfect for incremental improvement workflows with Claude Code and other AI tools.

## Features

- Zero Configuration - Works immediately without .textlintrc setup
- JSON Reports - Structured output for AI integration
- Human-Readable Output - Clear issue reports with suggestions
- Exit Codes - 0 for clean files, 1 when issues found
- Comprehensive Tests - Vitest test suite with 100% coverage
- TypeScript - Type-safe development with modern ES modules

## 🚀 Quick Start

```bash
# Check for AI-like expressions (human-readable)
npx ai-writing-fix-cli document.md

# Output JSON report (for AI integration)
npx ai-writing-fix-cli document.md --json > report.json
```

## Installation

```bash
# Run directly with npx (recommended)
npx ai-writing-fix-cli <file> [--json]

# Or install globally
npm install -g ai-writing-fix-cli
ai-fix <file> [--json]

# For development
git clone https://github.com/shinshin86/ai-writing-fix-cli.git
cd ai-writing-fix-cli
npm install
```

## Options

| Option | Description |
|--------|-------------|
| `--json` | Output structured JSON for AI tool integration |
| `--demo` | Display usage examples and demo |

### Report Format

The `--json` flag outputs structured JSON:

```json
{
  "file": "document.md",
  "issues": [
    {
      "line": 12,
      "column": 5,
      "rule": "@textlint-ja/ai-writing/no-ai-hype-expressions",
      "message": "Avoid hyperbolic expressions",
      "before": "revolutionary technology",
      "after": null
    }
  ]
}
```

- `after: null` indicates no automatic fix available
- Exit code 0: No issues found
- Exit code 1: Issues found (manual correction required)

## Claude Code Integration

Perfect for incremental improvement workflows. Follow these steps:

1. **Generate**: Claude creates content and saves to `draft.md`
2. **Check**: `npx ai-writing-fix-cli draft.md --json > report.json`
3. **Improve**: Claude processes `report.json` and fixes issues
4. **Repeat**: Continue until exit code 0

## Configuration

### Default Configuration

The tool **works immediately without any setup**. If no `.textlintrc` file exists, it uses built-in AI-writing detection rules:

```json
{
  "rules": {
    "@textlint-ja/preset-ai-writing": true
  }
}
```

### Custom Configuration

Create a `.textlintrc` file to customize rules:

```json
{
  "rules": {
    "@textlint-ja/preset-ai-writing": true,
    "preset-ja-technical-writing": {
      "preset": {
        "no-doubled-joshi": false
      }
    }
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in development mode (TypeScript directly)
npm run dev test.md --json

# Run tests
npm test

# Run tests in CI mode
npm run test:ci

# Test with sample files
npx . test/fixtures/ai-like.md --json
npx . test/fixtures/clean.md
```

## Textlint Rules

This tool includes rules from [`@textlint-ja/textlint-rule-preset-ai-writing`](https://github.com/textlint-ja/textlint-rule-preset-ai-writing):

| Rule | Description |
|------|-------------|
| `no-ai-list-formatting` | Detects mechanical list formatting with emojis |
| `no-ai-hype-expressions` | Catches hyperbolic expressions like "revolutionary" |
| `no-ai-emphasis-patterns` | Identifies formulaic emphasis patterns |
| `ai-tech-writing-guideline` | Comprehensive technical writing improvements |

## CI Integration

Example GitHub Actions workflow:

```yaml
name: AI Writing Lint
on: [pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npx ai-writing-fix-cli '**/*.md'
```

## Project Structure

```
ai-writing-fix-cli/
├── src/
│   └── ai-fix.ts      # TypeScript source code
├── dist/
│   ├── ai-fix.js      # Compiled JavaScript (main entry)
│   └── ai-fix.d.ts    # TypeScript declarations
├── test/
│   └── fixtures/      # Test sample files
│       ├── ai-like.md # File with AI-like expressions
│       └── clean.md   # Clean file for testing
├── ai-fix.test.ts     # TypeScript test suite
├── tsconfig.json      # TypeScript configuration
├── vitest.config.js   # Test configuration
├── .textlintrc        # Linting rules
├── package.json
├── README.md          # This file
└── README.ja.md       # Japanese documentation
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for your changes
4. Ensure all tests pass: `npm test`
5. Submit a pull request

## Links

- [textlint](https://textlint.github.io/)
- [preset-ai-writing](https://github.com/textlint-ja/textlint-rule-preset-ai-writing)
- [Claude Code](https://claude.ai/code)