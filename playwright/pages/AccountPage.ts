import { Page, Locator } from "@playwright/test";
import { BasePage } from "./BasePage";

export class AccountPage extends BasePage {
  readonly signInHeaderTrigger: Locator;
  readonly loginModal: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);

    this.signInHeaderTrigger = page
      .getByTestId("header-login-link")
      .or(page.getByRole("link", { name: /ввійти|увійти|sign in|log in/i }))
      .or(page.getByRole("button", { name: /ввійти|увійти|sign in|log in/i }));

    this.emailInput = page.locator('input#email[type="email"]');
    this.passwordInput = page.locator('input#password[type="password"]');

    this.submitButton = page.getByRole("button", {
      name: "Ввійти",
      exact: true,
    });

    this.loginModal = page.locator("fieldset").filter({ has: this.emailInput });
  }

  async open(): Promise<void> {
    await this.goto("/");
  }

  async openLoginModal(): Promise<void> {
    await this.signInHeaderTrigger.click();
    await this.page.waitForURL(/\/login/);
  }
}
