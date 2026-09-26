import { type Locator, type Page, expect } from "@playwright/test";

export class HomeSearchPage {
  private readonly searchInput: Locator;
  private readonly cookieAcceptButton: Locator;
  private readonly cookieDialog: Locator;
  private readonly cookieActions: Locator;

  constructor(private readonly page: Page) {
    this.searchInput = page.getByRole("searchbox", { name: "Пошук товарів" });
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

  /**
   * Submits a search query via the header search box.
   *
   * FIX 1 (confirmed via trace: URL was `/s/ike?q=ike` instead of `/s/Nike`
   * — the leading "N" was dropped): calling `.pressSequentially()`
   * immediately after `.click()` can race with the click's own focus event
   * settling, especially under WebKit, occasionally losing the first
   * keystroke. `expect(...).toBeFocused()` is a real, condition-based wait
   * confirming focus has actually landed before typing begins — not a
   * fixed pause. (Used here purely as an internal synchronization point,
   * not a result-verifying assertion — those stay in the spec.)
   *
   * FIX 2 (confirmed via trace: URL was still `/?input-field-search-name=Nike`,
   * never navigated, when the wait resolved): the previous condition
   * `url.search.includes("input-field-search-name")` matches an
   * intermediate URL state that appears WHILE typing, before Enter's real
   * navigation happens — so the `Promise.all` could resolve too early, on
   * the homepage rather than the results page. Now waits only for the
   * real results URL.
   */
  async searchFor(query: string): Promise<void> {
    await this.searchInput.click();
    await expect(this.searchInput).toBeFocused();
    await this.searchInput.pressSequentially(query);

    await Promise.all([
      this.page.waitForURL((url) => url.pathname.startsWith("/s/")),
      this.page.keyboard.press("Enter"),
    ]);
  }
}
