import { allDeckWithStatsResponseType } from '../../src/server/routes/anki';

export default class StudyMenu {
  constructor() {
    this.setupDecksIntercept();
  }

  setupDecksIntercept = () => {
    cy.fixture('deckInfo.json').then((data) => {
      let response: allDeckWithStatsResponseType = data;
      cy.intercept('GET', '/allDecksWithStats', {
        statusCode: 200,
        body: response,
      });
    });
  };

  visit() {
    cy.visit(Cypress.env('url') + '/study');
  }

  getDeckRows() {
    return cy.get('.deck-row');
  }

  tapDeck(deckName: string) {
    cy.contains('.deck-row', deckName).click();
  }
}
