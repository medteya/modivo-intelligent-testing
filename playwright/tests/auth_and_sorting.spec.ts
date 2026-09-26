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
    const initialCount = await listingPage.getProductCount();
    expect(initialCount).toBeGreaterThan(0);

    await listingPage.selectSortOption("Найнижча ціна");

    // Ensure the grid is still populated after sorting re-renders it.
    await expect(listingPage.productCards.first()).toBeVisible();
    const sortedCount = await listingPage.getProductCount();
    expect(sortedCount).toBeGreaterThan(0);

    // NOTE: overrides the project's default 10s expect timeout for this
    // one check. Confirmed via Playwright trace in an earlier round: the
    // sort itself succeeds (option selected, count unchanged) — a full
    // re-render for a large result set can genuinely take longer than 10s
    // under CI/WebKit's weaker resources. Still a real, condition-based
    // poll against actual page state, not a fixed sleep — only the
    // ceiling is raised.
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
          timeout: 30_000,
        },
      )
      .toBe(true);
  });
});
