import { HomeSearchPage } from "../support/pages/HomeSearchPage";
import { ProductListingPage } from "../support/pages/ProductListingPage";

describe("Search and category navigation", () => {
  const home = new HomeSearchPage();
  const listing = new ProductListingPage();
  const CARDS_TO_VERIFY = 4;

  beforeEach(() => {
    home.open();
  });

  it("TC05: user can search for a product using the search input", () => {
    const searchTerm = "adidas";

    home.searchFor(searchTerm);

    cy.location().should((location) => {
      const isParamValid =
        location.search.includes("q=") ||
        location.search.includes("input-field-search-name");

      expect(isParamValid, "search query parameter is present").to.be.true;

      expect(
        decodeURIComponent(location.href).toLowerCase(),
        "URL contains the search term",
      ).to.contain(searchTerm);
    });

    listing
      .productCards()
      .should("have.length.at.least", 1)
      .and(($cards) => {
        expect(
          $cards.text().toLowerCase(),
          "results reference the searched term",
        ).to.contain(searchTerm);
      });
  });

  it("TC06: user can navigate to a category page and product cards render correctly", () => {
    const department = { name: "ЖІНКА", path: "/m/zhinky.html" };
    const category = { name: "Одяг", path: "/c/zhinky/odyah" };

    home.openDepartment(department.path);

    cy.location("pathname").should("include", department.path);

    home.openCategory(category.path);

    cy.location("pathname").should("include", category.path);

    listing.pageHeading().should("be.visible").and("not.be.empty");

    listing.productCards().should("have.length.at.least", CARDS_TO_VERIFY);

    listing.productCards().each(($card, index) => {
      if (index >= CARDS_TO_VERIFY) {
        return false;
      }

      listing
        .productLink($card)
        .should("have.attr", "href")
        .and("match", /\/p\//);

      listing
        .productImage($card)
        .should("be.visible")
        .and(($img) => {
          const image = $img[0] as HTMLImageElement;
          expect(
            image.naturalWidth,
            `image ${index + 1} is loaded`,
          ).to.be.greaterThan(0);
        });

      listing.productPrice($card).should("be.visible");
    });
  });
});
