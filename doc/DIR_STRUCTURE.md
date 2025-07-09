```txt
game-hub/
├── .env.development # 開発環境用の環境変数
├── .env.production # 本番環境用の環境変数
├── .env.test # テスト環境用の環境変数
├── .eslintrc.json # ESLint 設定ファイル
├── .github/
│ └── workflows/
│ └── ci.yml # GitHub Actions CI/CD ワークフロー
├── .gitignore
├── .prettierrc.json # Prettier 設定ファイル
├── jest.config.js # Jest 設定ファイル
├── jest.setup.js # Jest のグローバルセットアップファイル
├── next-env.d.ts
├── next.config.mjs # Next.js 設定ファイル
├── package.json
├── package-lock.json
├── playwright.config.ts # Playwright 設定ファイル
├── tsconfig.json # TypeScript 設定ファイル
└── src/
├── **tests**/ # テストコード格納ディレクトリ
│ ├── e2e/
│ │ └── navigation.spec.ts # E2E テストのサンプル
│ ├── integration/
│ │ └── app/
│ │ └── HomePage.test.tsx # ページ結合テストのサンプル
│ └── unit/
│ └── domain/
│ └── score.test.ts # ドメインロジック単体テストのサンプル
├── app/
│ ├── favicon.ico
│ ├── globals.css
│ ├── layout.tsx # ルートレイアウト
│ └── page.tsx # ホームページ（最小限の実装）
├── domain/
│ └── score.ts # ドメインロジック（サンプル）
├── components/
│ └── ThemedButton.tsx # サンプルコンポーネント
└── lib/
└── env.ts # 環境変数を型安全に扱うためのファイル
```
