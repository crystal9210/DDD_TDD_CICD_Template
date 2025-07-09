# Project CI/CD, Security, and Quality Automation Documentation

## 概要

本プロジェクトは、**6 つの主要な自動化ワークフロー/設定ファイル**によって、
**品質保証・セキュリティ・依存管理・アクセシビリティ・パフォーマンス・ライセンスチェック**までを包括的に自動化しています。

このドキュメントは、**各 YAML ファイルの役割・動作内容・運用ポイント**を一切省略せずに詳細にまとめたものです。
**新規メンバーのオンボーディングや運用管理、監査対応にも活用できます。**

## 目次

1. [Continuous Integration (`ci.yml`)](#1-continuous-integration-ciyml)
2. [Dependabot (`dependabot.yml`)](#2-dependabot-dependabotyml)
3. [Snyk Security Scan (`snyk.yml`)](#3-snyk-security-scan-snykyml)
4. [FOSSA License Check (`fossa.yml`)](#4-fossa-license-check-fossayml)
5. [Lighthouse CI (`lighthouse.yml`)](#5-lighthouse-ci-lighthouseyml)
6. [Axe Accessibility Check (`axe.yml`)](#6-axe-accessibility-check-axeyml)
7. [Secrets・パッケージ・注意事項](#7-secretsパッケージ注意事項)
8. [運用・よくある質問](#8-運用よくある質問)

---

## 1. Continuous Integration (`ci.yml`)

### 目的

-   コード品質・セキュリティチェック
-   型チェック・Lint・Format・npm audit・CodeQL
-   ユニット/統合テスト・E2E テスト・カバレッジ収集
-   Vercel への Preview/Production デプロイ

### トリガー

-   `main`・`develop`ブランチへの push、pull_request

### 主なジョブと役割

#### job1: quality-checks

-   **型チェック**（TypeScript）
-   **Lint**（ESLint）
-   **コード整形チェック**（Prettier）
-   **セキュリティ監査**（npm audit）
-   **静的解析**（CodeQL）

#### job2: testing

-   **ユニット/統合テスト**（Jest）
-   **カバレッジ収集**（Codecov 連携）
-   **E2E テスト**（Playwright）
-   **E2E レポート成果物アップロード**

#### job3: build

-   **ビルド**（Next.js 等）

#### job4: vercel-preview

-   **Vercel Preview 環境へデプロイ**（PR や develop ブランチ時）

#### job5: e2e-on-vercel

-   **Vercel Preview 環境で E2E テスト実行**
-   **Playwright レポートアップロード**

#### job6: vercel-production

-   **main ブランチマージ時に Vercel Production へデプロイ**

## 2. Dependabot (`dependabot.yml`)

### 目的

-   依存パッケージ（npm）の自動アップデート PR 作成
-   セキュリティリスクやバグ修正の迅速な追従

### 主な設定

```yaml
version: 2

updates:
    - package-ecosystem: "npm" # Manage dependencies for npm (Node.js) projects
      directory: "/" # Root directory (location of package.json)
      schedule:
          interval: "daily" # Check for updates every day
          time: "06:00" # Run the check at 06:00 UTC (optional)
      open-pull-requests-limit: 5 # Limit the number of open PRs to 5 (prevents PR overload)
      security-updates-only: false # Create PRs for all updates, not just security fixes (set to true for security-only)
      allow:
          - dependency-type: "direct" # Include direct dependencies (listed in package.json)
          - dependency-type: "indirect" # Include indirect (transitive) dependencies (dependencies of dependencies)
```

### 運用ポイント

-   PR は自動で main 等にマージされず、**必ず CI/CD やレビューを経てマージ**
-   セキュリティアップデートのみ PR 化したい場合は`security-updates-only: true`に変更可能

## 3. Snyk Security Scan (`snyk.yml`)

### 目的

-   依存パッケージの脆弱性スキャン
-   Snyk ダッシュボードへの継続監視データ送信

### 主な設定

```yaml
name: Snyk Security Scan

on:
    push:
        branches: [main, develop]
    pull_request:
        branches: [main, develop]

jobs:
    security:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4 # Get repository code

            - name: Install dependencies
              run: npm ci # Clean install

            - name: Snyk Test (Vulnerability Scan)
              uses: snyk/actions/node@v4
              env:
                  SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
              with:
                  args: --severity-threshold=high # Only fail if high severity vulnerabilities are found

            - name: Snyk Monitor (Send to Dashboard)
              uses: snyk/actions/node@v4
              env:
                  SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
              with:
                  command: monitor # Upload dependency info to Snyk dashboard
```

### 運用ポイント

-   Snyk の API トークンは`SNYK_TOKEN`として GitHub Secrets に登録
-   脆弱性検出時は CI が fail（必要に応じて`continue-on-error`で警告のみも可）

## 4. FOSSA License Check (`fossa.yml`)

### 目的

-   OSS ライセンス違反やコンプライアンス問題の自動検出

### 主な設定

```yaml
name: FOSSA License Check

on:
    push:
        branches: [main, develop]
    pull_request:
        branches: [main, develop]

jobs:
    fossa:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - name: Run FOSSA scan
              uses: fossas/fossa-action@v1
              with:
                  api-key: ${{ secrets.FOSSA_API_KEY }}
```

### 運用ポイント

-   FOSSA の API キーは`FOSSA_API_KEY`として GitHub Secrets に登録
-   FOSSA ダッシュボードでライセンス問題を詳細に確認可能

## 5. Lighthouse CI (`lighthouse.yml`)

### 目的

-   Web アプリのパフォーマンス、PWA、SEO、アクセシビリティ等の自動計測

### 主な設定

```yaml
name: Lighthouse CI

on:
    push:
        branches: [main]
    pull_request:
        branches: [main]

jobs:
    lighthouse:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
              with:
                  node-version: "18"
            - run: npm ci
            - run: npm run build
            - run: npm run preview & # run the server in background
            - name: Wait for server
              run: npx wait-on http://localhost:3000
            - run: npx lhci autorun
```

### 運用ポイント

-   `wait-on`でサーバ起動を待機し、Lighthouse CI が安定動作
-   `lhci`の設定でレポート保存やスコア閾値設定も可能

## 6. Axe Accessibility Check (`axe.yml`)

### 目的

-   Web アクセシビリティ（WCAG 等）自動チェック

### 主な設定

```yaml
name: Axe Accessibility Check

on:
    push:
        branches: [main, develop]
    pull_request:
        branches: [main, develop]

jobs:
    axe:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
              with:
                  node-version: "18"
            - run: npm ci
            - run: npm run build
            - run: npm run preview & # run the server in background
            - name: Wait for server
              run: npx wait-on http://localhost:3000
            - name: Run axe accessibility checks
              uses: dequelabs/axe-core-github-action@v1
              with:
                  urls: "http://localhost:3000/,http://localhost:3000/about"
```

### 運用ポイント

-   `urls`で複数ページを指定可能
-   サーバ起動後に`wait-on`で待機し、axe の安定実行を保証

## 7. Secrets・パッケージ・注意事項

### 必要な GitHub Secrets

-   `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`（Vercel デプロイ用）
-   `CODECOV_TOKEN`（Codecov カバレッジ用）
-   `SNYK_TOKEN`（Snyk セキュリティ用）
-   `FOSSA_API_KEY`（FOSSA ライセンス用）

### 必要な npm パッケージ（devDependencies）

-   `playwright`, `jest`, `ts-jest`, `@testing-library/*`, `eslint`, `prettier`, `lhci`, `wait-on` など
-   `axe-core`（axe をローカルで使う場合）

### 注意事項

-   各ワークフローは**独立しており、競合しません**。
-   PR や push ごとに**自動で品質・セキュリティ・パフォーマンス等がチェックされます**。
-   レポートや成果物は GitHub Actions の「Artifacts」や各ダッシュボード（Snyk, FOSSA, Lighthouse）で確認可能。

## 8. 運用・よくある質問

### Q. 依存アップデートで壊れない？

-   Dependabot は PR を作成するだけで、**自動で main 等にマージされません**。
-   CI/CD や Snyk 等のチェックを通過し、レビュー後にマージする運用です。

### Q. 各種レポートはどこで見られる？

-   Playwright/E2E や Lighthouse のレポートは「Actions」→ 該当ワークフロー →「Artifacts」からダウンロード可能
-   Snyk/FOSSA は各サービスのダッシュボードで詳細確認

### Q. 追加で何か自動化したい場合は？

-   Slack/Discord 通知、PR コメント自動化、リリース自動化（semantic-release 等）も追加可能です。

## 9. 参考リンク

-   [GitHub Actions 公式ドキュメント](https://docs.github.com/ja/actions)
-   [Dependabot 公式ドキュメント](https://docs.github.com/ja/code-security/supply-chain-security/keeping-your-dependencies-updated-automatically/about-dependabot-version-updates)
-   [Snyk 公式](https://snyk.io/)
-   [FOSSA 公式](https://fossa.com/)
-   [Lighthouse CI 公式](https://github.com/GoogleChrome/lighthouse-ci)
-   [axe-core 公式](https://github.com/dequelabs/axe-core-github-action)
