import { addCardResponseType, decksResponseType } from "../../src/server/routes/anki";
import { translateResponseType } from "../../src/server/routes/translator";

export default class SearchPage {
  constructor() {
    this.setupTranslationIntercept();
    this.setupDecksIntercept();
    this.setupAddCardIntercept();
  }

  setupTranslationIntercept = () => {
    let englishResponse: translateResponseType = {
      english: 'Hello',
    };
    cy.intercept('GET', '/translate?spanish=Hola', {
      statusCode: 200,
      body: englishResponse,
    });
    let spanishResponse: translateResponseType = {
      spanish: 'Hola',
    };
    cy.intercept('GET', '/translate?english=Hello', {
      statusCode: 200,
      body: spanishResponse,
    });
  };
  setupDecksIntercept = () => {
    let response: decksResponseType = {
      result: ['default', 'deck2', 'deck3'],
    };
    cy.intercept('GET', '/decks', {
      statusCode: 200,
      body: response,
    });
  };
  setupAddCardIntercept = () => {
    let response: addCardResponseType = {
      success: true,
      message: null,
    };
    cy.intercept('POST', '/addCard', {
      statusCode: 200,
      body: response,
    }).as('addCard');
  };

  visit() {
    cy.visit(Cypress.env('url'));
  }

  typeQuery(query) {
    cy.get('.translationInput').type(query);
  }

  getTranslation() {
    return cy.get('.translationOutput');
  }

  switchTranslationDirection() {
    cy.get('.translationDirection').click();
  }

  openDeckDropdown() {
    cy.get('.ant-btn-icon-only').click();
  }

  getDeckDropdownItems() {
    return cy.get('.ant-dropdown-menu-item');
  }

  selectDeck(deckName) {
    cy.get('.ant-dropdown-menu-title-content').contains(deckName).click();
  }

  clickSaveToDeck() {
    cy.get('.saveToDeck').click();
  }

  switchSaveDirection() {
    cy.get('.saveDirection').click();
  }

  getAddCardRequest(): Cypress.Chainable {
    return cy.wait('@addCard');
  }
}
