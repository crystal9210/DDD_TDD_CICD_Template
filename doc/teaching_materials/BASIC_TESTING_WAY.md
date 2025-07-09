# TypeScript プロジェクトにおけるテスト関連ライブラリ・E2E テスト環境の導入と選定理由

本ドキュメントでは、TypeScript を用いたフロントエンド開発における**ユニットテスト・統合テスト**および**E2E（エンドツーエンド）テスト**のためのライブラリ選定理由、具体的なユースケース、設定内容を余すことなく詳細に解説します。

---

## 1. テストピラミッドと導入方針

-   **ユニットテスト**：小さな単位（関数・コンポーネント）の動作を保証
-   **統合テスト**：複数ユニットの連携や機能の結合を検証
-   **E2E テスト**：実際のユーザー操作を模倣し、アプリ全体の動作を検証

> テストピラミッドの概念に則り、各レイヤーで適切なテストを実装することで、品質と開発効率の両立を目指します[1][2][5]。

---

## 2. ユニット・統合テスト関連ライブラリ

### インストールコマンド

```shell

npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom ts-jest @types/jest

```

### 各ライブラリの選定理由とユースケース

| ライブラリ名                  | 選定理由・用途                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------- |
| **jest**                      | 高速で柔軟なテストランナー。モック・スナップショット・カバレッジ計測など機能が豊富。               |
| **@types/jest**               | Jest の TypeScript 型定義。型安全にテストコードを書ける。                                          |
| **ts-jest**                   | TypeScript コードを Jest で直接実行するためのトランスパイラ。                                      |
| **@testing-library/react**    | React コンポーネントの振る舞いテストに特化。「見た目」ではなく「振る舞い」を重視したテストが可能。 |
| **@testing-library/jest-dom** | DOM アサーションを拡張し、より直感的なテスト記述を実現。                                           |
| **jest-environment-jsdom**    | DOM 操作を伴うテストのための Jest 用環境。ブラウザライクな環境でテストを実行可能。                 |

#### 具体的ユースケース例

-   **jest**: 関数やロジックの単体テスト、スナップショットテスト、API のモック
-   **@testing-library/react**: ボタン押下やフォーム入力など、ユーザー操作を模倣したコンポーネントテスト
-   **@testing-library/jest-dom**: `toBeInTheDocument()`など、DOM 要素の存在や状態の検証
-   **ts-jest**: TypeScript で記述したテストコードの変換・実行

#### 設定例（jest.config.js）

```typescript
module.exports = {
    preset: "ts-jest",
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["@testing-library/jest-dom/extend-expect"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
    testMatch: [
        "**/__tests__/**/*.(ts|tsx|js)",
        "**/?(*.)+(spec|test).(ts|tsx|js)",
    ],
};
```

-   `testEnvironment: 'jsdom'`により、DOM 操作を伴うテストが可能[2][10]。

---

## 3. E2E テスト用ライブラリ（Playwright）

### インストールコマンド

```shell

npm install --save-dev @playwright/test

```

#### Playwright のブラウザバイナリインストール

```shell

npx playwright install

```

-   Chromium, Firefox, WebKit など主要ブラウザのバイナリがローカルに展開され、実際のブラウザでテストを自動実行可能[2][5]。

### Playwright の選定理由

-   **複数ブラウザ対応**：1 つのテストコードで主要ブラウザ全てを自動テスト可能
-   **高い自動化能力**：ユーザー操作（クリック・入力・遷移など）を忠実に再現
-   **動画・トレース記録**：失敗時の状況を可視化でき、デバッグ効率が向上
-   **CI/CD との親和性**：自動化パイプラインに容易に組み込める

### ユースケース

-   **本番同等環境でのユーザー体験検証**
-   **リグレッションテスト（回帰テスト）**
-   **複雑なワークフローや権限管理の検証**
-   **API・DB 連携を含むシナリオテスト**

---

## 4. Playwright 設定例（playwright.config.ts）

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "html",
    use: {
        baseURL: "http://localhost:3000",
        trace: "on-first-retry",
        video: "retain-on-failure",
    },
    projects: [
        { name: "chromium", use: { ...devices["Desktop Chrome"] } },
        { name: "firefox", use: { ...devices["Desktop Firefox"] } },
        { name: "webkit", use: { ...devices["Desktop Safari"] } },
    ],
    webServer: {
        command: "npm run dev",
        port: 3000,
        reuseExistingServer: !process.env.CI,
    },
});
```

-   `testDir`: E2E テストファイルのディレクトリ
-   `projects`: テスト対象ブラウザ
-   `webServer`: テスト実行時に開発サーバーを自動起動
-   `video`, `trace`: 失敗時のデバッグ用リソース記録[2][5]

---

## 5. package.json の scripts 設定例

```json

"scripts": {
"dev": "next dev",
"build": "next build",
"start": "next start",
"test": "jest",
"test:e2e": "playwright test",
"lint": "next lint"
}

```

-   `npm run test`: ユニット・統合テスト実行
-   `npm run test:e2e`: E2E テスト実行[2]

---

## 6. テストケース管理・運用

-   **ユニット・統合テスト**：各機能・コンポーネント単位でテストファイルを配置（例: `src/components/Button/Button.test.tsx`）
-   **E2E テスト**：`/e2e`ディレクトリ以下にシナリオごとのテストファイルを作成（例: `e2e/login.spec.ts`）
-   **テストケース管理**：スプレッドシート等で仕様・手順・進捗を管理し、実装状況を可視化[3]

---

## 7. 参考：テストの種類と特徴

| テスト種別     | 目的・特徴                                       | 主な利用ライブラリ           |
| -------------- | ------------------------------------------------ | ---------------------------- |
| ユニットテスト | 最小単位のロジック検証。高速・局所的な品質保証。 | jest, ts-jest, @types/jest   |
| 統合テスト     | 複数ユニットの連携・結合動作の検証。             | @testing-library/react, jest |
| E2E テスト     | 実際のブラウザを用いたユーザー体験の自動検証。   | @playwright/test, Playwright |

---

## 8. 補足

-   **TypeScript 対応**：全てのテストコード・設定ファイルは TypeScript で記述可能
-   **CI/CD 連携**：GitHub Actions 等に組み込むことで、プルリクエストごとに自動テスト実行が可能

---

> 本ドキュメントは、現場の実践・運用に即した形で、ライブラリ選定理由・具体的な設定・運用方法まで一切省略せず記載しています。プロジェクトの品質保証・効率的な開発運用のため、適宜ご活用ください。

```

[1] https://findy-tools.io/products/playwright/33/189
[2] https://shinagawa-web.com/blogs/nextjs-app-router-testing-setup
[3] https://qiita.com/suin/items/73b3605e6a139de11794
[4] https://www.ey-office.com/blog_archive/2023/05/10/build-react-test-environment-with-jest-or-vitest-and-react-testing-library/
[5] https://zenn.dev/b13o/articles/about-playwright
[6] https://zenn.dev/yuyan/books/baf46cad5901c7/viewer/1527ce
[7] https://giginc.co.jp/blog/giglab/playwright
[8] https://qiita.com/yk-graph/items/adbbdfb05315c88864ac
[9] https://zenn.dev/yuu104/articles/what-is-e2e-test
[10] https://zenn.dev/satoshie/articles/82a55fc935d0db
```
