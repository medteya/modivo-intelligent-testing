import { type Locator, type Page, expect } from "@playwright/test";

export class HomeSearchPage {
  private readonly searchInput: Locator;
  private readonly cookieAcceptButton: Locator;
  private readonly cookieDialog: Locator;
  private readonly cookieActions: Locator;

  constructor(private readonly page: Page) {
    this.searchInput = page
      .getByRole("searchbox", { name: "Пошук товарів" })
      .or(page.locator("input[name='q']"));
    this.cookieDialog = page.locator(".modal-consents");
    this.cookieActions = this.cookieDialog.locator(".buttons");
    this.cookieAcceptButton = page.getByTestId("customer-consents-button");
  }

  async goto(): Promise<void> {
    await this.page.goto("/");
    await this.searchInput.waitFor({ state: "visible" });
    await this.dismissCookieBannerIfPresent();

    const browserName = this.page.context().browser()?.browserType().name();
    if (browserName === "chromium") {
      await this.page.waitForURL(/cookie_consent=true/).catch(() => {});
    }
  }

  async dismissCookieBannerIfPresent(): Promise<void> {
    const bannerAppeared = await this.cookieAcceptButton
      .waitFor({ state: "visible" })
      .then(() => true)
      .catch(() => false);

    if (!bannerAppeared) {
      return;
    }

    await this.cookieActions.scrollIntoViewIfNeeded();
    await this.cookieAcceptButton.click();
    await this.cookieDialog.waitFor({ state: "hidden" });
  }

  async searchFor(query: string): Promise<void> {
    await this.searchInput.waitFor({ state: "visible" });
    await this.searchInput.click();
    await expect(this.searchInput).toBeFocused();
    await this.searchInput.fill(query);

    const showAllResultsButton = this.page.getByRole("button", {
      name: "Показати всі результати",
    });
    await showAllResultsButton.waitFor({ state: "visible" });

    await Promise.all([
      this.page.waitForURL((url) => url.pathname.startsWith("/s/")),
      showAllResultsButton.click(),
    ]);
  }
}
