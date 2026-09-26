/// <reference types="cypress" />

type Chain = Cypress.Chainable<JQuery<HTMLElement>>;

export class HomeSearchPage {
  private readonly selectors = {
    cookieAcceptButton: [
      '[data-test-id="customer-consents-button"]',
      '[data-testid="cookie-accept"]',
      '[data-testid*="accept" i][data-testid*="cookie" i]',
      "#onetrust-accept-btn-handler",
      "#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll",
      'button[id*="accept" i][id*="cookie" i]',
    ].join(", "),

    searchInput: [
      '[data-testid="search-input"]',
      'input[type="search"]',
      'input[role="searchbox"]',
      'input[aria-label*="Пошук" i]',
      'input[placeholder*="Пошук" i]',
    ].join(", "),
  } as const;

  private departmentLinkSelector(departmentPath: string): string {
    return [
      `a[data-test-id="department-link"][href$="${departmentPath}"]`,
      `a[href$="${departmentPath}"]`,
    ].join(", ");
  }

  private categoryLinkSelector(categoryPath: string): string {
    return [
      `a[data-test-id="navigation-item-link"][href$="${categoryPath}"]`,
      `a[href$="${categoryPath}"]`,
    ].join(", ");
  }

  open(): this {
    cy.visit("/");
    this.acceptCookies();
    return this;
  }

  acceptCookies(): this {
    cy.get(this.selectors.cookieAcceptButton).should("be.visible").click();
    cy.get(this.selectors.cookieAcceptButton).should("not.exist");
    return this;
  }

  searchInput(): Chain {
    return cy.get(this.selectors.searchInput).filter(":visible").first();
  }

  searchFor(term: string): this {
    this.searchInput().should("be.visible").and("be.enabled").type(term);
    this.searchInput().should("have.value", term).type("{enter}");
    return this;
  }

  departmentLink(departmentPath: string): Chain {
    return cy
      .get(this.departmentLinkSelector(departmentPath))
      .filter(":visible")
      .first();
  }

  openDepartment(departmentPath: string): this {
    this.departmentLink(departmentPath).should("be.visible").click();
    return this;
  }

  categoryLink(categoryPath: string): Chain {
    return cy
      .get(this.categoryLinkSelector(categoryPath))
      .filter(":visible")
      .first();
  }

  openCategory(categoryPath: string): this {
    this.categoryLink(categoryPath).should("be.visible").click();
    return this;
  }
}
