import { Page, Locator } from "@playwright/test";

export abstract class BasePage {
  protected readonly page: Page;
  protected readonly cookieConsentDialog: Locator;
  protected readonly cookieConsentAcceptButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cookieConsentDialog = page.locator(".modal-consents");
    this.cookieConsentAcceptButton = page.getByTestId(
      "customer-consents-button",
    );
  }

  async goto(path: string = "/"): Promise<void> {
    await this.page.goto(path);
    await this.resolveCookieConsentIfPresent();
  }

  private async resolveCookieConsentIfPresent(): Promise<void> {
    const bannerAppeared = await this.cookieConsentAcceptButton
      .waitFor({ state: "visible" })
      .then(() => true)
      .catch(() => false);

    if (!bannerAppeared) {
      return;
    }

    await this.cookieConsentAcceptButton.click();

    await this.page
      .waitForURL(/[?&]cookie_consent=true(?:&|$)/)
      .catch(() => undefined);
  }
}
