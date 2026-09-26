import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ListingPage extends BasePage {
  readonly sortTrigger: Locator;
  readonly sortOptionsList: Locator;
  readonly productCards: Locator;

  /**
   * CONFIRMED via DevTools: the current (active) price sits in
   * `.product-price .price-wrapper`; its sibling `.price-previous-wrapper`
   * (the old, crossed-out price on discounted items) is a different class
   * and is deliberately NOT matched here.
   *
   * "Спонсоровано" (sponsored) cards are excluded: CONFIRMED via trace
   * that they're pinned at fixed positions regardless of sort order, by
   * design — including them breaks the ascending-order check even when
   * the real sort is correct.
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

  async open(path: string): Promise<void> {
    await this.goto(path);
  }

  sortOption(name: RegExp | string): Locator {
    return this.sortOptionsList
      .locator("ul.list li.cell-list")
      .filter({ hasText: name });
  }

  async selectSortOption(optionName: RegExp | string): Promise<void> {
    await this.sortTrigger.click();
    await this.sortOption(optionName).click();
  }

  async getProductCount(): Promise<number> {
    return this.productCards.count();
  }

  /**
   * Reads prices via the CONFIRMED, sponsored-excluding `productPrices`
   * locator (see its own doc comment) rather than looping every card with
   * a separate, unconfirmed selector list — keeps this method's result
   * consistent with what was actually verified against the live DOM.
   */
  async getVisibleProductPrices(): Promise<number[]> {
    const rawPrices = await this.productPrices.allTextContents();

    return rawPrices
      .map((raw) => raw.replace(/[^\d.,]/g, "").replace(",", "."))
      .filter((value) => value.length > 0)
      .map((value) => parseFloat(value));
  }
}
