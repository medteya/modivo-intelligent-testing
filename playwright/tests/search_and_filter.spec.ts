import { expect, test } from "@playwright/test";
import { HomeSearchPage } from "../pages/HomeSearchPage";
import { ProductListingPage } from "../pages/ProductListingPage";

const SEARCH_TERM = "Nike";
const COLOR_FILTER = "Білий";

test.describe("Search and product listing filters", () => {
  test.beforeEach(async ({ page }) => {
    const home = new HomeSearchPage(page);
    await home.goto();
  });

  test("returns a Nike product grid after submitting search from the home page", async ({
    page,
  }) => {
    const home = new HomeSearchPage(page);
    const listing = new ProductListingPage(page);

    await home.searchFor(SEARCH_TERM);
    await listing.waitForGrid();

    await expect(page).toHaveURL(/\/s\/Nike/i);
    await expect(listing.resultsHeading).toHaveText(/Результати для:\s*Nike/i);
    await expect(listing.productTiles.first()).toBeVisible();
    await expect(listing.productTiles.first()).toContainText(/Nike/i);
  });

  test("narrows the search grid when a color filter is applied", async ({
    page,
  }) => {
    const home = new HomeSearchPage(page);
    const listing = new ProductListingPage(page);

    await home.searchFor(SEARCH_TERM);
    await listing.waitForGrid();
    const unfilteredCount = await listing.productTiles.count();

    await listing.applyColorFilter(COLOR_FILTER);

    await expect(page).toHaveURL(/kolir:bilii/i);
    await expect(listing.colorFilterControl).toHaveText(/Колір\s*1/);
    await expect(listing.appliedFiltersControl).toBeVisible();
    await expect(listing.appliedFiltersControl).toHaveText(
      /Вибрані фільтри\s*\(1\)/,
    );
    await expect(listing.productTiles.first()).toBeVisible();
    await expect(listing.productTiles.first()).toContainText(COLOR_FILTER);
    expect(unfilteredCount).toBeGreaterThan(0);
  });
});
