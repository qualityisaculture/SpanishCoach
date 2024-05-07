import { Card } from '../../src/Types';
import _ from 'lodash';
import {
  answerCardRequestType,
  answerCardResponseType,
  dueCardsResponseType,
  updateCardResponseType,
} from '../../src/server/routes/anki';
import EditComponent from '../e2e/components/Edit.component';

export function getMockCard(type: string, id: number): Card {
  return {
    "id": id,
    "noteId": id,
    "front": `${type} card front ${id+1}`,
    "back": `${type} card back ${id+1}`,
    "failInterval": "0",
    "hardInterval": "0",
    "mediumInterval": "0",
    "easyInterval": "0",
    "due": 0,
    "isNew": true,
    "leftToStudy": 0
  }
}

export function getMockCards(newCount: number, learnCount: number, dueCount: number): dueCardsResponseType {
  let newCards: Card[] = _.range(0, newCount).map((i: number) => getMockCard("new", i));
  let dueCards: Card[] = _.range(0, dueCount).map((i: number) => getMockCard("due", i));
  let learnCards: Card[] = _.range(0, learnCount).map((i: number) => getMockCard("learn", i));
  return {
    "new": newCards,
    "due": dueCards,
    "learn": learnCards,
  }
}

export default class StudyCard {
  constructor(cards? : dueCardsResponseType) {
    this.setupDueCardsIntercept(cards);
    this.setupSaveCardIntercept();
    this.setupAnswerCardIntercept();
  }

  setupDueCardsIntercept = async (cards?: dueCardsResponseType) => {
    cy.fixture('cardInfo.json').then((data) => { 
      let response: dueCardsResponseType = cards ? cards : data;
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

  setupAnswerCardIntercept = () => {
    cy.intercept('POST', '/answerCard', {
      statusCode: 200,
      body: 'response',
    });
  }

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

  getModalButton() {
    return cy.get('.modal-button');
  }

  getChatModal() { 
    return cy.get('.ant-modal-content')
  }

  tapModalButton() {
    this.getModalButton().click();
  }

  tapAnswerEasy() {
    cy.get('#answer-easy').click();
  }
}
