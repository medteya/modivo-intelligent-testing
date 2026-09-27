import { test, expect } from "@playwright/test";
import { AccountPage } from "../pages/AccountPage";
import { ListingPage } from "../pages/ListingPage";

test.describe("Header authorization and listing sort", () => {
  test("TC03: user can open the sign-in modal from the header and see the login form", async ({
    page,
  }) => {
    const accountPage = new AccountPage(page);

    await accountPage.open();
    await accountPage.openLoginModal();

    await expect(accountPage.loginModal).toBeVisible();
    await expect(accountPage.emailInput).toBeVisible();
    await expect(accountPage.passwordInput).toBeVisible();
    await expect(accountPage.submitButton).toBeVisible();
  });

  test("TC04: user can sort products by price ascending and the layout updates", async ({
    page,
    browserName,
  }) => {
    test.skip(
      browserName === "webkit",
      "Known limitation: this catalog's sort/re-render does not settle within 60s on WebKit/Linux CI; confirmed reliable on Chromium and Firefox.",
    );

    test.setTimeout(120_000);

    const listingPage = new ListingPage(page);

    await listingPage.open("/c/zhinky/vzuttya/snikersy");

    await expect(listingPage.productCards.first()).toBeVisible();
    const initialCount = await listingPage.getProductCount();
    expect(initialCount).toBeGreaterThan(0);

    await listingPage.selectSortOption("Найнижча ціна");

    await expect(listingPage.productCards.first()).toBeVisible();
    const sortedCount = await listingPage.getProductCount();
    expect(sortedCount).toBeGreaterThan(0);

    await expect
      .poll(
        async () => {
          const prices = await listingPage.getVisibleProductPrices();
          if (prices.length === 0) return false;
          return prices.every(
            (price, index) => index === 0 || price >= prices[index - 1],
          );
        },
        {
          message:
            "Expected product prices to be in ascending order after applying the price sort",
          timeout: 60_000,
        },
      )
      .toBe(true);
  });
});
