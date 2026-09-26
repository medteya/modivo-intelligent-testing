/// <reference types="cypress" />

type Chain = Cypress.Chainable<JQuery<HTMLElement>>;

export class ProductListingPage {
  private readonly selectors = {
    pageHeading: "h1",
    productCard: [
      '[data-test-id="product-list-item"]',
      '[data-testid="product-card"]',
      "li[data-product-card]",
      'article:has(a[href*="/p/"])',
    ].join(", "),
    cardLink: 'a[href*="/p/"]',
    cardImage: "img",
  } as const;

  readonly pricePattern: RegExp = /\d[\d\s.,]*\s?(грн|₴|UAH)/i;

  pageHeading(): Chain {
    return cy.get(this.selectors.pageHeading).filter(":visible").first();
  }

  productCards(): Chain {
    return cy.get(this.selectors.productCard);
  }

  productLink($card: JQuery<HTMLElement>): Chain {
    return cy.wrap($card).find(this.selectors.cardLink).first();
  }

  productImage($card: JQuery<HTMLElement>): Chain {
    return cy
      .wrap($card)
      .find(this.selectors.cardImage)
      .first()
      .scrollIntoView();
  }

  productPrice($card: JQuery<HTMLElement>): Chain {
    return cy.wrap($card).contains(this.pricePattern);
  }
}
