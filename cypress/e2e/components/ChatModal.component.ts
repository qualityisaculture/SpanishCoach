/// <reference types="Cypress" />

export default class ChatModal {
  interceptedRequests: any[];
  constructor() {
    this.setupChatResponseIntercept();
    this.interceptedRequests = [];
  }

  setupChatResponseIntercept = () => {
    cy.intercept('GET', '/chat?messages=**', (request) => {
      return new Promise((resolve) => {
        this.interceptedRequests.push(resolve);
      }).then((response) => {
        request.reply({
          statusCode: 200,
          body: response,
        });
      });
    }).as('chatRequest');
  };

  tapClose() {
    cy.get('.ant-modal-close').click();
  }

  getChatMessage(index: number) {
    return cy.get(`:nth-child(${index}) > .chat-message-text`);
  }

  getChatInput() {
    return cy.get('#modalInput');
  }

  fillChatInput = (text: string) => {
    this.getChatInput().clear().type(text);
  };

  addToChatInput = (text: string) => {
    this.getChatInput().type(text);
  };

  tapSend() {
    return cy.get('#modal > button').click();
  }

  getChatRequest = () => {
    return cy.wait('@chatRequest');
  };

  respondToChat = (response: string) => {
    let sendResponse = this.interceptedRequests.shift();
    sendResponse(response);
  };
}
