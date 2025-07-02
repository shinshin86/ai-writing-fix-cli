#!/usr/bin/env node
import { createLinter, loadTextlintrc } from 'textlint';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { defaultConfig } from './default-config.js';
import os from 'node:os';

interface TextlintMessage {
  loc: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  ruleId: string;
  message: string;
  fix?: { text: string };
}

interface Issue {
  line: number;
  column: number;
  rule: string;
  message: string;
  before: string;
  after: string | null;
}

interface Report {
  file: string;
  issues: Issue[];
}

// Parse command line arguments
const [,, file, ...flags] = process.argv;

// Handle --demo flag
if (file === '--demo' || flags.includes('--demo')) {
  console.log('🚀 AI-Writing Fix CLI Demo');
  console.log('');
  console.log('This tool detects AI-like expressions in Japanese text:');
  console.log('- 🎯 Hyperbolic expressions (革命的、世界初)');
  console.log('- 🚀 Mechanical emoji lists');
  console.log('- ⚡ Formulaic emphasis patterns');
  console.log('');
  console.log('Try with your own file:');
  console.log('  npx ai-writing-fix-cli your-file.md --json');
  console.log('');
  console.log('For Claude Code integration:');
  console.log('  npx ai-writing-fix-cli draft.md --json > report.json');
  process.exit(0);
}

// Show usage if no file provided
if (!file) {
  console.error('AI-Writing Fix CLI - Detect AI-like expressions in Japanese text');
  console.error('');
  console.error('Usage: ai-fix <file> [--json]');
  console.error('');
  console.error('Options:');
  console.error('  --json     Output structured JSON report for AI tools');
  console.error('  --demo     Show quick demo and usage examples');
  console.error('');
  console.error('Examples:');
  console.error('  ai-fix document.md              # Show issues found');
  console.error('  ai-fix document.md --json       # JSON output for AI tools');
  console.error('');
  console.error('Perfect for Claude Code integration! 🤖');
  process.exit(1);
}

// Parse flags
const isJson: boolean = flags.includes('--json');

let tempConfigPath: string | null = null;

try {
  // Resolve file path
  const filePath: string = path.resolve(file);
  
  // Check if file exists
  try {
    await fs.access(filePath);
  } catch {
    console.error(`Error: File not found: ${filePath}`);
    process.exit(1);
  }

  // Read original content
  const originalContent: string = await fs.readFile(filePath, 'utf8');

  // Load textlint configuration with fallback to default
  let descriptor;
  let usingDefaultConfig = false;
  
  // Check if .textlintrc exists in current directory
  const hasLocalConfig = await fs.access('.textlintrc').then(() => true).catch(() => false);
  
  if (hasLocalConfig) {
    descriptor = await loadTextlintrc();
  } else {
    // Use default configuration if no .textlintrc found
    usingDefaultConfig = true;
    
    // Create temporary config file
    tempConfigPath = path.join(os.tmpdir(), `textlintrc-${Date.now()}.json`);
    await fs.writeFile(tempConfigPath, JSON.stringify(defaultConfig, null, 2));
    
    // Load from temporary config
    descriptor = await loadTextlintrc({
      configFilePath: tempConfigPath
    });
  }

  // Create linter instance
  const linter = createLinter({
    descriptor: descriptor
  });

  // First, lint the file to get all messages
  const lintResults = await linter.lintFiles([filePath]);
  const lintResult = lintResults[0];
  
  if (!lintResult) {
    console.error('Error: No result from textlint');
    process.exit(1);
  }
  
  // Then try to fix (even though current rules might not be fixable)
  const fixResults = await linter.fixFiles([filePath]);
  const fixResult = fixResults[0];

  if (!fixResult) {
    console.error('Error: No result from textlint fix');
    process.exit(1);
  }
  
  // Use lint messages since fix doesn't provide them for non-fixable rules
  const allMessages: TextlintMessage[] = lintResult.messages || [];

  // Handle --json mode
  if (isJson) {
    const lines: string[] = originalContent.split('\n');
    
    // Use messages from lint result since fix result doesn't include non-fixable messages
    const messages: TextlintMessage[] = allMessages;

    // Create issues array with before/after information
    const issues: Issue[] = messages.map((message: TextlintMessage) => {
      const startLine: number = message.loc.start.line - 1;
      const endLine: number = message.loc.end.line - 1;
      
      // Extract the problematic text
      let beforeText: string = '';
      if (startLine === endLine) {
        // Single line
        beforeText = lines[startLine].substring(
          message.loc.start.column - 1,
          message.loc.end.column - 1
        );
      } else {
        // Multi-line
        const textLines: string[] = [];
        for (let i = startLine; i <= endLine; i++) {
          if (i === startLine) {
            textLines.push(lines[i].substring(message.loc.start.column - 1));
          } else if (i === endLine) {
            textLines.push(lines[i].substring(0, message.loc.end.column - 1));
          } else {
            textLines.push(lines[i]);
          }
        }
        beforeText = textLines.join('\n');
      }

      return {
        line: message.loc.start.line,
        column: message.loc.start.column,
        rule: message.ruleId,
        message: message.message,
        before: beforeText,
        after: message.fix ? message.fix.text : null
      };
    });

    // Output JSON report
    const report: Report = {
      file: filePath,
      issues: issues
    };

    console.log(JSON.stringify(report, null, 2));
  }

  // Default mode: show issues in human-readable format
  else {
    if (usingDefaultConfig && allMessages.length >= 0) {
      console.log('ℹ️  Using default AI-writing detection rules (no .textlintrc found)');
      console.log();
    }
    
    if (allMessages.length > 0) {
      console.log(`Found ${allMessages.length} issue(s) in ${filePath}:`);
      console.log();
      allMessages.forEach((msg: TextlintMessage, i: number) => {
        console.log(`${i + 1}. Line ${msg.loc.start.line}: ${msg.message}`);
        console.log(`   Rule: ${msg.ruleId}`);
        console.log();
      });
      console.log('Note: These rules detect AI-like patterns but do not provide automatic fixes.');
      console.log('Use --json flag for structured JSON output compatible with AI tools.');
      if (usingDefaultConfig) {
        console.log('\nTip: Create a .textlintrc file to customize rules or add more checks.');
      }
    } else {
      console.log(`✅ No AI-like issues found in: ${filePath}`);
      if (usingDefaultConfig) {
        console.log('   (Using default detection rules - create .textlintrc for more options)');
      }
    }
  }

  // Set exit code based on whether there are any messages
  process.exitCode = allMessages.length > 0 ? 1 : 0;

  // Clean up temporary config file if created
  if (tempConfigPath) {
    try {
      await fs.unlink(tempConfigPath);
    } catch {
      // Ignore cleanup errors
    }
  }

} catch (error) {
  const err = error as Error;
  console.error('Error:', err.message);
  if (err.stack && process.env.DEBUG) {
    console.error(err.stack);
  }
  
  // Clean up temporary config file if created
  if (tempConfigPath) {
    try {
      await fs.unlink(tempConfigPath);
    } catch {
      // Ignore cleanup errors
    }
  }
  
  process.exit(1);
}