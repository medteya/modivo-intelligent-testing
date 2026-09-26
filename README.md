# Modivo Intelligent Testing & Automation

## Summary

This project implements robust, cross-browser End-to-End (E2E) automation testing for [Modivo.ua](https://modivo.ua/) using both **Playwright** (integrated with Cursor & Claude AI tools via MCP) and **Cypress**. The test suite covers user authentication, catalog navigation, search mechanics, and sorting workflows, utilizing the Page Object Model (POM) architectural pattern and ISTQB-compliant test structuring.

## Requirements

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **Cursor IDE** & **Claude Desktop** (for AI-assisted test generation workflows)

## Installation Steps

1. Clone the repository
2. Install project dependencies:

```
npm install
```

```
npx playwright install
```

## Steps to Launch

- Playwright Tests:
  Run tests in headless mode across Chromium, Firefox, and WebKit:
  ```
  npx playwright test`
  ```
  Run tests in interactive UI mode:
  ```
  npx playwright test --ui
  ```
- Cypress Tests:
  Run Cypress tests in headless mode:
  ```
  npx cypress run
  ```
  Open the interactive Cypress Test Runner GUI:
  ```
  npx cypress open
  ```

## Steps to Generate Reports

- Playwright Reports
  Playwright automatically generates an HTML report after execution. To view it locally, run:
  ```
  npx playwright show-report
  ```
- Cypress Reports & Artifacts
  Cypress captures execution recordings and snapshots on failure. Screenshots and videos can be found directly under:
  `cypress/screenshots/` and `cypress/videos/`
