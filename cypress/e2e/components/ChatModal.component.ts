/// <reference types="Cypress" />
export default class ChatModal {
  constructor() {
    this.setupChatResponseIntercept();
  }

  setupChatResponseIntercept = () => {
    cy.intercept('GET', '/chat?messages=**', (req) => {
      req.reply({
        statusCode: 200,
        body: 'response',
      });
    }).as('chatRequest');
  };

  tapClose() {
    cy.get('#close').click();
  }

  getChatMessage(index: number) {
    return cy.get(`.chat-message-text:nth-of-type(${index})`);
  }

  getChatInput() {
    return cy.get('#modalInput');
  }

  fillChatInput = (text: string) => {
    this.getChatInput().clear().type(text);
  }

  addToChatInput = (text: string) => {
    this.getChatInput().type(text);
  }

  tapSend() {
    cy.get('#modal > button').click();
  }
  
  getChatRequest = () => {
    return cy.wait('@chatRequest');
  }
}