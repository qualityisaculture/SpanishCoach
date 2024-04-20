import {
  dueCardsResponseType,
  updateCardResponseType,
} from '../../src/server/routes/anki';
import EditComponent from '../e2e/components/Edit.component';

export default class StudyCard {
  constructor() {
    this.setupDueCardsIntercept();
    this.setupSaveCardIntercept();
    this.setupChatResponseIntercept();
  }

  setupDueCardsIntercept = () => {
    cy.fixture('cardInfo.json').then((data) => {
      let response: dueCardsResponseType = data;
      cy.intercept('GET', '/dueCards?deck=deck1', {
        statusCode: 200,
        body: response,
      });
    });
  };

  setupSaveCardIntercept = () => {
    let response: updateCardResponseType = {
      success: true,
      message: null,
    };
    cy.intercept('POST', '/updateCard', {
      statusCode: 200,
      body: response,
    });
  };

  setupChatResponseIntercept = () => {
    cy.intercept('GET', '/chat?messages=**', (req) => {
      req.reply({
        statusCode: 200,
        body: 'response',
      });
    }).as('chatRequest');
  };

  tapBack() {
    cy.get('#back').click();
  }

  tapEdit() {
    cy.get('#edit').click();
  }

  tapSave() {
    cy.get('#save').click();
  }

  tapCancel() {
    cy.get('#cancel').click();
  }

  getCardFront() {
    return cy.get('.card-front');
  }

  getCardFrontEditComponent() {
    return new EditComponent(1);
  }

  getCardBack() {
    return cy.get('.card-back');
  }

  getCardBackEditComponent() {
    return new EditComponent(3);
  }

  getCard() {
    return cy.get('.card');
  }

  tapCard() {
    cy.get('.card').click();
  }

  tapModalButton() {
    cy.get('.modal-button').click();
  }

  tapAnswerEasy() {
    cy.get('#answer-easy').click();
  }
}
