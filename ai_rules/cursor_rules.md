# Cursor Engineering Rules — modivo.ua Test Automation

These rules are **mandatory** for all code generated, reviewed, or refactored in this repository. They apply to Playwright TypeScript tests targeting **https://modivo.ua**. Violations are defects, not style nits.

**Stack:** Playwright Test + TypeScript. Cypress is not an accepted authoring target for new work.

---

## 1. Page Object Model (POM) — strict separation

### Required architecture

| Layer | Location | Responsibility | Forbidden |
| --- | --- | --- | --- |
| Tests | `tests/**/*.spec.ts` | Arrange (preconditions), act via page objects, assert expected results | Locators, `page.locator`, `getBy*`, clicks, fills, navigation details |
| Page objects | `pages/**/*.ts` | Encapsulate locators and user-facing actions for one page or major component | `expect()`, business assertions, test data factories, unrelated pages |
| Fixtures / helpers | `fixtures/`, `helpers/` | Shared setup, auth, API prep, test data | Mixing page locators into generic helpers |
| Config | `playwright.config.ts` | Timeouts, base URL, projects, reporters | Test logic |

### Rules

1. **Every UI interaction lives in a page object.** Test files may only call page-object methods and Playwright `expect` on values or locators *returned for assertion*, never on raw selectors invented in the spec.
2. **Locators are private.** Expose them as `private readonly` fields or private getters. Do not export locator strings or `Locator` instances for tests to poke at unless a dedicated assertion accessor is required (e.g. `get heading()` used only with `expect`).
3. **One page (or cohesive component) per class.** Name classes `HomePage`, `ProductListingPage`, `ProductDetailsPage`, `CartPage`, `CheckoutPage`, `HeaderComponent`, etc. Reuse shared chrome via composition, not copy-paste.
4. **Actions describe user intent**, not DOM mechanics: `searchFor(query)`, `addCurrentSizeToCart()`, `openCategory(name)` — not `clickCssNthChild()`.
5. **Page objects do not assert test outcomes.** They may wait for action-completion *states* (navigation, overlay closed, button enabled) that belong to the action itself. Outcome verification belongs in the spec (`expect`).
6. **Tests do not use `page.goto` with ad-hoc URLs** except through page-object `goto()` / navigation methods or a single approved navigation helper. Prefer `baseURL` in config (`https://modivo.ua`).
7. **No locators in specs.** `test`, `expect`, page-object calls, and fixtures only.

### Canonical shape

```typescript
import { type Locator, type Page } from '@playwright/test';

export class CartPage {
  private readonly checkoutButton: Locator;

  constructor(private readonly page: Page) {
    this.checkoutButton = page.getByRole('button', { name: /оформити|checkout/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/cart');
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
```

Specs import the page class (or a fixture that provides it), call methods, then assert.

---

## 2. ISTQB-compliant test design

Every automated test must map to a **test case** with identifiable **preconditions**, **steps**, and **expected results**. Ambiguous or exploratory scripts are not mergeable.

### Structure

- Use `test.describe` for a feature, risk area, or requirement cluster (e.g. cart, search, checkout).
- Use `test` titles that state the **condition and expected outcome**, not implementation:  
  `adds selected size to cart and shows updated quantity` — not `click add button`.
- **Preconditions** belong in `test.beforeEach`, fixtures, or an explicit Arrange block at the start of the test (authenticated user, empty cart, specific locale, product in stock). Do not hide preconditions inside page actions.
- **Steps** are sequential, observable user or system actions via page objects. One logical flow per test unless a documented scenario requires a short, cohesive sequence.
- **Expected results** are explicit `expect` assertions after the relevant step or at the end of the scenario. A test with no assertion is invalid.
- Prefer **independence**: tests must not rely on execution order or leftover UI state from another test. Shared mutable state (cart, session) must be reset in fixtures or `beforeEach`.
- Cover **equivalence partitions, boundaries, and negative paths** where they add risk coverage (invalid size, empty search, out-of-stock). Do not duplicate the same happy path across files.
- Traceability: when a requirement, ticket, or risk ID exists, put it in the test title or `test.info().annotations`.

### Assertions

- Assert **observable outcomes**: URL, visible text, counts, enabled/disabled, cart badge, order confirmation — not implementation details (CSS class hashes, animation frames).
- Each assertion must encode a **definitive expected result** (value, visibility, count, error message). Soft assertions (`expect.soft`) are allowed only when multiple independent outcomes of one step must be reported together; the test must still fail if any soft check fails.
- Do not treat “did not throw” as a pass.

---

## 3. TypeScript and Playwright locators

### TypeScript

- Strict typing: no `any`. Use `unknown` only at true boundaries, then narrow.
- Explicit return types on public page-object methods (`Promise<void>`, `Promise<string>`).
- Prefer `import type` for type-only imports.
- Enable and respect strict compiler options. Do not silence errors with `as` casts unless the alternative is worse and a one-line comment states why.
- Async/await only — no floating promises. Every Playwright call that returns a Promise must be awaited.
- No `var`. Prefer `const`; `let` only when reassignment is required.

### Locator priority (mandatory order)

1. `getByTestId` / `data-testid` (or the project’s agreed test id attribute).
2. `getByRole` with accessible name (`button`, `link`, `textbox`, `heading`, `navigation`).
3. `getByLabel`, `getByPlaceholder`, `getByAltText`, `getByTitle` when they reflect real UI semantics.
4. `getByText` for unique, stable, user-visible copy (account for uk-UA vs other locales if tests are locale-specific).
5. Semantic CSS only as last resort among *allowed* selectors: landmark/role-stable attributes (`[data-qa]`, name, type) — never generated hashes.

### Forbidden locators

- XPath (`xpath=`, `//div[...]`) except a **documented, time-boxed exception** when no accessible or test-id hook exists; file a follow-up to add a test id.
- Absolute positional chains: `nth-child`, `div > div > span` as the primary selector.
- Selectors tied to CSS-in-JS hashes, obfuscated class names, or layout-only classes.
- Index-only targeting (`nth(3)`) unless the index **is** the business meaning (e.g. first search result) and is asserted as such.

### Resilience

- Scope locators to a region (`getByRole('dialog')`, header, product card) before matching inner controls.
- Prefer user-facing names that survive copy tweaks via reasonable regex only when the UI is bilingual or slightly variable; do not regex everything.
- Filter lists with `filter({ hasText, has })` rather than brittle DOM walks.

---

## 4. Zero flakiness policy

**Hardcoded waits are banned.** This includes, without exception:

- `page.waitForTimeout(...)`
- `setTimeout` / `sleep` / `delay` helpers used to “let the page settle”
- Arbitrary pause comments (`// wait 2s for animation`)
- Inflated default timeouts used to hide races

### Required waiting model

1. Rely on Playwright **auto-waiting** on actions (`click`, `fill`, `check`, `selectOption`).
2. Wait on **conditions**, not time:
   - `expect(locator).toBeVisible()` / `toBeHidden()` / `toBeEnabled()` / `toHaveCount()` / `toHaveText()` / `toHaveURL()` / `toHaveAttribute()`
   - `locator.waitFor({ state: 'visible' | 'hidden' | 'attached' | 'detached' })` only inside page objects when the wait is part of completing an action
   - `page.waitForURL` / `waitForLoadState` only when navigation or network idle is the real contract — prefer `waitForURL` and response-driven setup over `networkidle` as a default
3. Use **web-first assertions** (`await expect(locator).…`). They retry until the timeout. Do not `expect(await locator.textContent())` unless you have already waited for a stable state.
4. Configure sensible **global** `timeout` / `expect.timeout` / `actionTimeout` in `playwright.config.ts`. Do not sprinkle per-step magic numbers. Per-assertion `{ timeout }` is allowed only for a known slow, documented UI (e.g. 3DS, payment redirect) with a comment citing the reason.
5. **No race with animations or lazy load** by sleeping. Assert the post-condition (overlay gone, spinner not visible, product grid count > 0).
6. **Stability over retries.** Local `retries: 0`. CI retries may exist as a safety net; they are not a license for flaky tests. A test that fails without retries must be fixed, not retried into green.
7. Isolate third-party noise (cookie banners, chat widgets, A/B overlays) in a dedicated helper that waits for a **state** (banner dismissed / not visible), never a fixed delay.
8. Do not use `waitForSelector` + immediate click as a pattern; use locator actions and assertions.

### Fail-fast signals of flakiness (do not merge)

- Intermittent `strict mode violation` (locator resolved to N elements) — tighten the locator.
- Click intercepted / overlay — wait for overlay hidden, then act.
- Navigation timeout after click — wait for URL or load as part of the page action.
- `toHaveText` empty then filled — assert visibility or use auto-retrying expect, do not sleep.

---

## 5. Clean code, naming, modularity, errors

### Naming

| Kind | Convention | Examples |
| --- | --- | --- |
| Page classes | PascalCase + `Page` / `Component` | `ProductDetailsPage` |
| Files | kebab-case matching the class | `product-details.page.ts`, `cart.spec.ts` |
| Methods | verb + intent | `applyPriceFilter`, `submitLogin` |
| Locators (private) | noun / element role | `addToCartButton`, `searchInput` |
| Tests | behavior in present tense | `shows empty cart message when cart has no items` |
| Fixtures | what they provide | `loggedInBuyer`, `emptyCart` |

### Modularity

- DRY: shared flows (accept cookies, login, search, add to cart) live in page objects or fixtures — never duplicated across specs.
- Keep methods small. If a method needs a comment to explain three screens, split it.
- Test data: typed constants or factories in `test-data/`; no magic SKUs inline in ten files. Prefer data that is valid on **modivo.ua** (real in-stock products, locale `uk`).
- Secrets and credentials: environment variables only. Never commit passwords, tokens, or personal data.
- Do not mix API setup with UI locators. API can establish preconditions; UI still goes through POM for browser actions.

### Error handling

- Let Playwright failures surface with default traces (`trace: 'on-first-retry'` or `on-first-failure` as configured). Do not swallow errors in empty `catch`.
- If a page object catches, it must rethrow with context: page name, action, and relevant URL or product id. Never convert a failed click into a silent `return`.
- Guard optional UI (geo popup, newsletter) with explicit “if visible, dismiss” using locator visibility checks — not try/catch around clicks.
- `test.skip` / `fixme` require a reason (ticket or comment). Do not skip to hide flakes.
- No `test.only` or `test.describe.only` in committed code (`forbidOnly` on CI).

### Quality bar

- One assertion *theme* per test is preferred; multiple asserts are fine when they verify one expected result set of a single scenario.
- Comments explain *why* (locale quirk, known storefront overlay), not *what* the next line does.
- Match existing project formatting; do not reformat unrelated files.
- New tests must run deterministically against Chromium at minimum before they are considered done.

---

## Agent and contributor checklist

Before finishing any change, confirm:

- [ ] Specs contain no locators, XPath, or `waitForTimeout` / sleeps
- [ ] New UI is covered by a page object with private locators and intent-named methods
- [ ] Each test documents preconditions, performs clear steps, and has definitive `expect` results
- [ ] Locators follow the priority list; no brittle CSS/XPath
- [ ] Waits are condition-based (auto-wait + web-first assertions)
- [ ] Names are descriptive; errors are not swallowed; no secrets committed
- [ ] Target application is **modivo.ua**; `baseURL` and paths stay consistent

If a rule must be broken, the code comment must state **why**, **what the follow-up is**, and **when it expires**. Undocumented exceptions are rejected.
