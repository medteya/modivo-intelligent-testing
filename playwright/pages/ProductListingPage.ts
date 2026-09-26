import type { Locator, Page } from '@playwright/test';

export class ProductListingPage {
  private readonly heading: Locator;
  private readonly productCards: Locator;
  private readonly colorFilterButton: Locator;
  private readonly applyFiltersButton: Locator;
  private readonly selectedFiltersToggle: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.productCards = page.locator('a.product-card-link');
    this.colorFilterButton = page.getByRole('button', { name: /^Колір/ }).first();
    this.applyFiltersButton = page.getByRole('button', { name: 'Показати', exact: true });
    this.selectedFiltersToggle = page.getByRole('button', {
      name: /Вибрані фільтри/,
    });
  }

  get resultsHeading(): Locator {
    return this.heading;
  }

  get productTiles(): Locator {
    return this.productCards;
  }

  get appliedFiltersControl(): Locator {
    return this.selectedFiltersToggle;
  }

  get colorFilterControl(): Locator {
    return this.colorFilterButton;
  }

  async waitForGrid(): Promise<void> {
    await this.heading.waitFor({ state: 'visible' });
    await this.productCards.first().waitFor({ state: 'visible' });
  }

  async applyColorFilter(colorName: string): Promise<void> {
    await this.colorFilterButton.click();
    await this.page.getByRole('button', { name: colorName, exact: true }).click();
    await this.applyFiltersButton.click();
    await this.page.waitForURL((url) => url.pathname.includes('kolir:'));
    await this.productCards.first().waitFor({ state: 'visible' });
  }
}
