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
  }) => {
    const listingPage = new ListingPage(page);

    await listingPage.open("/c/zhinky/vzuttya/snikersy");

    await expect(listingPage.productCards.first()).toBeVisible();
    const initialProductCount = await listingPage.getProductCount();
    expect(initialProductCount).toBeGreaterThan(1);

    await listingPage.selectSortOption("Найнижча ціна");

    await expect(listingPage.productCards).toHaveCount(initialProductCount);

    await expect
      .poll(
        async () => {
          const prices = await listingPage.getVisibleProductPrices();
          return prices.every(
            (price, index) => index === 0 || price >= prices[index - 1],
          );
        },
        {
          message:
            "Expected product prices to be in ascending order after applying the price sort",
        },
      )
      .toBe(true);
  });
});
