# AI-Writing Fix CLI

[![Tests](https://github.com/shinshin86/ai-writing-fix-cli/actions/workflows/test.yml/badge.svg)](https://github.com/shinshin86/ai-writing-fix-cli/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

日本語テキストの「AIっぽい」表現を検出するCLIツール（設定不要ですぐ使える）

[English README](./README.md)

## 🚀 クイックスタート

```bash
# AIっぽい表現をチェック（人間向け表示）
npx ai-writing-fix-cli document.md

# JSON形式でレポート出力（AI連携用）
npx ai-writing-fix-cli document.md --json > report.json
```

## インストール

```bash
# npxで直接実行（推奨）
npx ai-writing-fix-cli <file> [--json]

# またはグローバルインストール
npm install -g ai-writing-fix-cli
ai-fix <file> [--json]

# 開発用
git clone https://github.com/shinshin86/ai-writing-fix-cli.git
cd ai-writing-fix-cli
npm install
```

## このツールが検出するもの

- 絵文字付きの機械的なリスト
- 「革命的」「世界初」などの誇張表現
- 「重要！」などの定型的な強調パターン
- 冗長で抽象的な技術文書

## Claude Code との連携

```bash
# 1. Claudeがコンテンツを生成
# 2. AIっぽさをチェック
npx ai-writing-fix-cli draft.md --json > report.json
# 3. ClaudeがJSONレポートを読んで修正
# 4. exit code 0になるまで繰り返し
```

## オプション

| オプション | 説明 |
|----------|------|
| `--json` | JSON形式でレポート出力（AI連携用） |
| `--demo` | 使用例とデモを表示 |

## JSON レポート形式

```json
{
  "file": "document.md",
  "issues": [
    {
      "line": 12,
      "column": 5,
      "rule": "@textlint-ja/ai-writing/no-ai-hype-expressions",
      "message": "「革命的な」という表現は過度に誇張的...",
      "before": "革命的な技術",
      "after": null  // 自動修正不可
    }
  ]
}
```

- `after: null` は自動修正不可を示す
- Exit code 0: 問題なし
- Exit code 1: 問題あり（手動対応が必要）

## 設定

### デフォルト設定

**設定不要ですぐに使えます**。`.textlintrc` ファイルがない場合は、内蔵のAI文章検出ルールを使用：

```json
{
  "rules": {
    "@textlint-ja/preset-ai-writing": true
  }
}
```

### カスタム設定

ルールをカスタマイズしたい場合は `.textlintrc` ファイルを作成：

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

## 開発

```bash
# 依存関係インストール
npm install

# TypeScriptビルド
npm run build

# 開発モード（TypeScript直接実行）
npm run dev test.md --json

# テスト実行
npm test

# CI用テスト実行
npm run test:ci

# サンプルファイルでテスト
npx . test/fixtures/ai-like.md --json
npx . test/fixtures/clean.md
```

## textlintルール

[`@textlint-ja/textlint-rule-preset-ai-writing`](https://github.com/textlint-ja/textlint-rule-preset-ai-writing) のルール：

| ルール | 説明 |
|-------|------|
| `no-ai-list-formatting` | 絵文字付きの機械的なリスト記法を検出 |
| `no-ai-hype-expressions` | 「革命的」などの誇張表現を検出 |
| `no-ai-emphasis-patterns` | 定型的な強調パターンを検出 |
| `ai-tech-writing-guideline` | 総合的な技術文書改善 |

## CI連携

GitHub Actions の例：

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


## Contributing

PRを歓迎します！テストを追加して `npm test` でパスすることを確認してください。

## ライセンス

MIT License

## リンク

- [textlint](https://textlint.github.io/)
- [preset-ai-writing](https://github.com/textlint-ja/textlint-rule-preset-ai-writing)
- [Claude Code](https://claude.ai/code)