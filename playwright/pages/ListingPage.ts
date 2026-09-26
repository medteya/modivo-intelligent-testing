import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Page Object: Product Listing Page (PLP) — sorting control and product grid.
 *
 * LOCATOR STRATEGY:
 * `productCards` (`a.product-card-link`) is CONFIRMED working — the last
 * real test run got past the product-count check successfully.
 *
 * `sortTrigger`'s primary selector is CONFIRMED via DevTools: a button
 * with the exact visible text "Сортувати" (class "dropdown-filter-component").
 *
 * `sortOptionsList`/`sortOption` are now also CONFIRMED via DevTools. This
 * dropdown uses NO ARIA roles at all — no `listbox`/`option` — it's a
 * plain custom list: `.sort-dropdown .dropdown-list ul.list li.cell-list`.
 * Options are therefore matched by their visible text via `.filter({ hasText })`
 * rather than `getByRole`.
 *
 * `productPrices` is now also CONFIRMED via DevTools (see field doc below).
 *
 * The cookie-consent race that previously affected `selectSortOption` is
 * now resolved proactively in `BasePage.goto()` before any test code
 * runs — see that method's doc comment for details.
 *
 * This project's real test-id attribute is `data-test-id` (hyphenated),
 * confirmed via DevTools — `page.getByTestId()` already respects that via
 * playwright.config.ts's `testIdAttribute`, so it's used below instead of
 * hand-written `[data-testid="..."]` selectors.
 */
export class ListingPage extends BasePage {
  /** Trigger that opens the sorting dropdown. CONFIRMED exact button text. */
  readonly sortTrigger: Locator;

  /** Container holding the list of sort options once opened. CONFIRMED. */
  readonly sortOptionsList: Locator;

  /** All product tiles/cards currently rendered in the grid. CONFIRMED. */
  readonly productCards: Locator;

  /**
   * Price element scoped to each product card. CONFIRMED via DevTools:
   * `.product-price .price-wrapper` holds the current (active) price. Its
   * sibling `.price-previous-wrapper` holds the old, crossed-out price on
   * discounted items and is deliberately NOT matched here, so a discount
   * badge never pollutes the parsed price with a second concatenated
   * number.
   */
  /**
   * Price element scoped to each ORGANIC (non-sponsored) product card.
   *
   * CONFIRMED via Playwright trace: the grid includes cards labeled
   * "Спонсоровано" (Sponsored) pinned at fixed positions regardless of the
   * active sort order — standard e-commerce behavior for paid placements.
   * A strict "every price >= previous price" check across ALL cards is
   * therefore not a valid invariant of this page; sponsored cards are
   * excluded here so the ordering check reflects only the organically
   * sorted results. `productCards` (used for the total-count check)
   * intentionally still includes them, since the grid's total size is
   * unaffected by sponsorship.
   */
  readonly productPrices: Locator;

  constructor(page: Page) {
    super(page);

    this.sortTrigger = page
      .getByRole("button", { name: "Сортувати", exact: true })
      .or(page.getByTestId("sort-dropdown-trigger"))
      .or(
        page
          .locator(".dropdown-filter-component")
          .filter({ hasText: /сортувати/i }),
      );

    this.sortOptionsList = page.locator(".sort-dropdown .dropdown-list");

    this.productCards = page
      .locator("a.product-card-link")
      .or(page.getByTestId("product-card"))
      .or(page.locator("article"));

    this.productPrices = this.productCards
      .filter({ hasNotText: "Спонсоровано" })
      .locator(".product-price .price-wrapper");
  }

  /** Navigates directly to a given category / listing URL path. */
  async open(path: string): Promise<void> {
    await this.goto(path);
  }

  /**
   * Locator for a single sort option matching the given visible text,
   * e.g. `'Найнижча ціна'` for "price: low to high" (the confirmed real
   * label — full option set: За замовчуванням / Найновіше / Найнижча
   * ціна / Найвища ціна).
   *
   * CONFIRMED: options are `<li class="cell-list ...">` items inside
   * `ul.list` — no ARIA roles are present, so matching is done by visible
   * text content rather than `getByRole('option', ...)`.
   */
  sortOption(name: RegExp | string): Locator {
    return this.sortOptionsList
      .locator("ul.list li.cell-list")
      .filter({ hasText: name });
  }

  /**
   * Opens the sort control and selects the option whose visible text
   * matches `optionName`.
   *
   * The cookie-consent dialog that previously raced with this action (see
   * git history / prior investigation) is now resolved proactively in
   * `BasePage.goto()`, immediately after navigation and before any test
   * code runs — confirmed deterministic, not timing-dependent — so by the
   * time this method runs, consent is already settled and the dropdown
   * won't be interrupted. Relies solely on Playwright's auto-waiting
   * (click actionability checks) — no arbitrary pauses are used.
   */
  async selectSortOption(optionName: RegExp | string): Promise<void> {
    await this.sortTrigger.click();
    await this.sortOption(optionName).click();
  }

  /** Number of product cards currently rendered in the grid. */
  async getProductCount(): Promise<number> {
    return this.productCards.count();
  }

  /**
   * Reads and parses all currently visible product prices, in the grid's
   * current DOM order, into numbers (currency symbols/whitespace stripped,
   * decimal comma normalised to a dot). Used by specs to assert ordering.
   */
  async getVisibleProductPrices(): Promise<number[]> {
    const rawPrices = await this.productPrices.allTextContents();

    return rawPrices
      .map((raw) => raw.replace(/[^\d.,]/g, "").replace(",", "."))
      .filter((value) => value.length > 0)
      .map((value) => parseFloat(value));
  }
}
