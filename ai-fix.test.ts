import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { spawn, ChildProcess } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_PATH = path.join(__dirname, 'dist', 'ai-fix.js');
const FIXTURES_DIR = path.join(__dirname, 'test', 'fixtures');

interface CLIResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

// Helper function to run the CLI
function runCLI(args: string[] = []): Promise<CLIResult> {
  return new Promise((resolve) => {
    const child: ChildProcess = spawn('node', [CLI_PATH, ...args]);
    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

describe('ai-fix CLI', () => {
  describe('basic functionality', () => {
    it('should show usage when no arguments provided', async () => {
      const result = await runCLI();
      
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('Usage: ai-fix <file>');
      expect(result.stderr).toContain('--json');
      expect(result.stderr).not.toContain('--dry');
    });

    it('should handle non-existent file', async () => {
      const result = await runCLI(['non-existent.md']);
      
      expect(result.code).toBe(1);
      expect(result.stderr).toContain('Error: File not found');
    });
  });

  describe('--json mode', () => {
    it('should output JSON report for file with AI-like expressions', async () => {
      const aiLikeFile = path.join(FIXTURES_DIR, 'ai-like.md');
      const result = await runCLI([aiLikeFile, '--json']);
      
      expect(result.code).toBe(1); // Should exit with 1 when issues found
      expect(result.stderr).toBe('');
      
      const report = JSON.parse(result.stdout);
      expect(report).toHaveProperty('file');
      expect(report).toHaveProperty('issues');
      expect(report.file).toBe(aiLikeFile);
      expect(report.issues).toBeInstanceOf(Array);
      expect(report.issues.length).toBeGreaterThan(0);
      
      // Check for specific AI writing issues
      const hypeExpressions = report.issues.filter((issue: any) => 
        issue.rule.includes('no-ai-hype-expressions')
      );
      expect(hypeExpressions.length).toBeGreaterThan(0);
      
      const listFormatting = report.issues.filter((issue: any) => 
        issue.rule.includes('no-ai-list-formatting')
      );
      expect(listFormatting.length).toBeGreaterThan(0);
      
      // Check issue structure
      const firstIssue = report.issues[0];
      expect(firstIssue).toHaveProperty('line');
      expect(firstIssue).toHaveProperty('column');
      expect(firstIssue).toHaveProperty('rule');
      expect(firstIssue).toHaveProperty('message');
      expect(firstIssue).toHaveProperty('before');
      expect(firstIssue).toHaveProperty('after');
      expect(firstIssue.after).toBe(null); // These rules don't provide fixes
    });

    it('should output empty issues array for clean file', async () => {
      const cleanFile = path.join(FIXTURES_DIR, 'clean.md');
      const result = await runCLI([cleanFile, '--json']);
      
      expect(result.code).toBe(0); // Should exit with 0 when no issues
      expect(result.stderr).toBe('');
      
      const report = JSON.parse(result.stdout);
      expect(report.file).toBe(cleanFile);
      expect(report.issues).toEqual([]);
    });
  });

  describe('default mode', () => {
    it('should show issues in human-readable format', async () => {
      const aiLikeFile = path.join(FIXTURES_DIR, 'ai-like.md');
      const originalContent = await fs.readFile(aiLikeFile, 'utf8');
      
      const result = await runCLI([aiLikeFile]);
      
      expect(result.code).toBe(1);
      expect(result.stdout).toContain('Found');
      expect(result.stdout).toContain('issue(s)');
      expect(result.stdout).toContain('Line');
      expect(result.stdout).toContain('Rule:');
      expect(result.stdout).toContain('Note: These rules detect AI-like patterns');
      expect(result.stdout).toContain('Use --json flag for structured JSON output');
      
      // Verify file wasn't modified
      const afterContent = await fs.readFile(aiLikeFile, 'utf8');
      expect(afterContent).toBe(originalContent);
    });

    it('should show success message for clean file', async () => {
      const cleanFile = path.join(FIXTURES_DIR, 'clean.md');
      const result = await runCLI([cleanFile]);
      
      expect(result.code).toBe(0);
      expect(result.stdout).toContain('✅ No AI-like issues found');
    });
  });


  describe('exit codes', () => {
    it('should exit with 1 when issues are found', async () => {
      const aiLikeFile = path.join(FIXTURES_DIR, 'ai-like.md');
      
      const reportResult = await runCLI([aiLikeFile, '--json']);
      expect(reportResult.code).toBe(1);
      
      const defaultResult = await runCLI([aiLikeFile]);
      expect(defaultResult.code).toBe(1);
    });

    it('should exit with 0 when no issues are found', async () => {
      const cleanFile = path.join(FIXTURES_DIR, 'clean.md');
      
      const reportResult = await runCLI([cleanFile, '--json']);
      expect(reportResult.code).toBe(0);
      
      const defaultResult = await runCLI([cleanFile]);
      expect(defaultResult.code).toBe(0);
    });
  });
});