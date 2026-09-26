import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class ListingPage extends BasePage {
  readonly sortTrigger: Locator;
  readonly sortOptionsList: Locator;
  readonly productCards: Locator;
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
    await this.sortTrigger.waitFor({ state: "visible" });
    await this.sortTrigger.click();

    const option = this.sortOption(optionName);
    await option.waitFor({ state: "visible" });
    await option.scrollIntoViewIfNeeded();
    await option.click();
  }

  async getProductCount(): Promise<number> {
    return this.productCards.count();
  }

  async getVisibleProductPrices(): Promise<number[]> {
    const cards = this.productCards;
    const count = await cards.count();
    const prices: number[] = [];

    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const priceElement = card
        .locator('[data-testid="product-price"], .price-box, .price')
        .last();
      const priceText = await priceElement.innerText();

      const numericPrice = parseFloat(
        priceText.replace(/[^\d.,]/g, "").replace(",", "."),
      );
      if (!isNaN(numericPrice)) {
        prices.push(numericPrice);
      }
    }
    return prices;
  }
}
