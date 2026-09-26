# Prompt History Log

Append-only record of prompts used to generate, configure, or refactor automation in this repository (target: **modivo.ua**).

**How to log an entry**

1. Add a new row to the summary table in the matching section (newest first).
2. Add a matching detail block with the **exact** prompt text — do not paraphrase, trim, or “improve” it.
3. Fill every column: **Date**, **Tool Used** (Cursor / Claude), **Target Framework**, **Exact Prompt Text**.
4. Use ISO dates (`YYYY-MM-DD`). If the same prompt was run more than once, add a new row.

---

## 1. Cursor AI Prompts (Playwright & Rules)

Prompts issued in **Cursor** for Playwright work, project rules, and related scaffolding.

| Date       | Tool Used | Target Framework                      | Exact Prompt Text       |
| ---------- | --------- | ------------------------------------- | ----------------------- |
| 2026-09-21 | Cursor    | Playwright                            | See [CUR-003](#cur-003) |
| 2026-09-21 | Cursor    | Playwright (rules / repo conventions) | See [CUR-002](#cur-002) |
| 2026-09-21 | Cursor    | Playwright (rules / repo conventions) | See [CUR-001](#cur-001) |

### CUR-003

| Date       | Tool Used | Target Framework |
| ---------- | --------- | ---------------- |
| 2026-09-21 | Cursor    | Playwright       |

**Exact Prompt Text**

```
Using the rules in ai_rules/cursor_rules.md:
1. Create a Home/Search Page Object in playwright/pages/HomeSearchPage.ts for modivo.ua handling navigation, cookie banners, and search submission.
2. Create a Product Listing Page Object in playwright/pages/ProductListingPage.ts handling filters and grid updates.
3. Create an ISTQB-compliant test file in playwright/tests/search_and_filter.spec.ts containing two test cases: product search and product filtering, ensuring zero hardcoded timeouts and clean TypeScript typing.
4. Finally, update prompts/prompts.md to add this exact prompt under the Cursor AI Prompts section as CUR-003 with today's date and target framework Playwright.
```

### CUR-002

| Date       | Tool Used | Target Framework                      |
| ---------- | --------- | ------------------------------------- |
| 2026-09-21 | Cursor    | Playwright (rules / repo conventions) |

**Exact Prompt Text**

```
Create a file at prompts/prompts.md that will serve as the prompt history log for this repository. Set up clean Markdown sections for:
1. Cursor AI Prompts (Playwright & Rules)
2. Claude Desktop Prompts (Playwright)
3. Cypress Prompts & Generation
Include columns or headers for Date, Tool Used (Cursor/Claude), Target Framework, and the Exact Prompt Text.
```

### CUR-001

| Date       | Tool Used | Target Framework                      |
| ---------- | --------- | ------------------------------------- |
| 2026-09-21 | Cursor    | Playwright (rules / repo conventions) |

**Exact Prompt Text**

```
Create a file at ai_rules/cursor_rules.md that establishes strict, professional coding and engineering rules for this test automation repository targeting modivo.ua. The rules must enforce:

1. Strict Page Object Model (POM) architecture: completely separating element locators and page actions from test scripts and assertions.
2. ISTQB-compliant test design principles: ensuring test cases maintain clear preconditions, logical steps, and definitive expected results.
3. Clean TypeScript syntax for Playwright, utilizing robust and resilient locators (preferring data-testid, aria labels, or semantic CSS selectors over brittle XPaths).
4. Zero flakiness policy: strictly prohibiting hardcoded timeouts, arbitrary pauses, or fixed sleep statements (such as page.waitForTimeout). Instead, enforce Playwright's built-in auto-waiting, dynamic element states, and explicit assertion checks.
5. Clean code practices: descriptive naming conventions, modular design, and proper error handling across all test suites.
```

---

## 2. Claude Desktop Prompts (Playwright)

### CLAUDE-001

Prompts issued in **Claude Desktop** for Playwright generation, review, or refactoring.

| Date       | Tool Used | Target Framework |
| ---------- | --------- | ---------------- |
| 2026-09-21 | Claude    | Playwright       |

**Exact Prompt Text**

```
You are an expert QA Automation Engineer. We are building a professional test automation suite for https://modivo.ua/ using Playwright and TypeScript.

Please adhere strictly to these engineering rules:

1. Strict Page Object Model (POM) architecture: Keep element locators and page actions inside page object files, while test specs only handle setup, calling methods, and assertions.
2. ISTQB-compliant test cases: Clearly document preconditions, sequential steps, and definitive expected results in comments or descriptions.
3. Zero flakiness: Prohibit all hardcoded timeouts, arbitrary pauses, or fixed sleep statements (like page.waitForTimeout). Use Playwright's auto-waiting and web-first assertions.
4. Resilient locators: Prefer data-testid, aria labels, or robust semantic CSS selectors.

Please create:

1. A new Page Object in playwright/pages/AccountPage.ts (or update existing page objects) to handle login modal / account navigation interactions.
2. A new test file in playwright/tests/auth_and_sorting.spec.ts containing 2 test cases:
   - TC03: Verify user can open the sign-in / authorization modal from the header and check form visibility.
   - TC04: Verify user can change the product sorting option (e.g., sort by price from lowest to highest) on a listing page and verify the layout/order updates dynamically.

Provide clean, fully typed TypeScript code ready for inclusion in our project.
```

---

## 3. Cypress Prompts & Generation

### CYP-001

Prompts used to generate, migrate, or compare **Cypress** suites (Claude). New production work in this repo should still follow `ai_rules/cursor_rules.md` (Playwright). Log Cypress prompts here for history and provenance.

| Date       | Tool Used | Target Framework |
| ---------- | --------- | ---------------- |
| 2026-09-24 | Claude    | Cypress          |

**Exact Prompt Text**

```
You are an expert QA Automation Engineer. We are building a professional test automation suite for https://modivo.ua/ using Cypress and TypeScript.

Please adhere strictly to these engineering rules:
1. Strict Page Object Model (POM) architecture: Keep element locators and page actions inside page object files (e.g., under cypress/support/pages), while test specs only handle setup, calling methods, and assertions.
2. ISTQB-compliant test cases: Clearly document preconditions, sequential steps, and definitive expected results in comments or descriptions.
3. Zero flakiness: Prohibit all hardcoded timeouts, arbitrary pauses, or fixed sleep statements (like cy.wait). Use Cypress's built-in automatic retrying assertions.
4. Resilient locators: Prefer data-testid, aria labels, or robust semantic CSS selectors.

Please create:
1. A Page Object structure for modivo.ua inside cypress/support/pages (e.g., HomeSearchPage.ts) handling navigation, cookie acceptance, and search.
2. A test file in cypress/e2e/search_and_navigation.cy.ts containing 2 ISTQB-compliant test cases:
   - TC05: Verify user can successfully search for a product using the search input.
   - TC06: Verify user can navigate to a category page and verify product cards render correctly.

Provide clean, fully typed TypeScript code ready for inclusion in our project.
```

<!-- Template — duplicate, fill, and move above the empty row.

### CYP-XXX

| Date | Tool Used | Target Framework |
| --- | --- | --- |
| YYYY-MM-DD | Cursor | Cypress |

**Exact Prompt Text**

```
Paste the exact prompt here.
```
-->
