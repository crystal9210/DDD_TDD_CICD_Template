import { defineConfig } from "@playwright/test";

export default defineConfig({
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
        headless: true,
        trace: "on-first-retry",
        video: "retain-on-failure",
    },
    reporter: [["html", { outputFolder: "playwright-report" }]],
});
