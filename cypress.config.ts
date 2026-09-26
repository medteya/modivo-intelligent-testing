import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "https://modivo.ua",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",

    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,

    viewportWidth: 1280,
    viewportHeight: 800,

    setupNodeEvents(_on, _config) {},
  },
});
