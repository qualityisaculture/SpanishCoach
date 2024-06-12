/// <reference types="Cypress" />

export default class EditComponent {
  index: number;

  constructor(index: number) {
    this.index = index;
  }
  
  getInput = () => {
    return cy.get(`.edit-component:nth-of-type(${this.index}) > input`);
  }

  fillInput = (text: string) => {
    this.getInput().clear().type(text);
  }

  addToInput = (text: string) => {
    this.getInput().type(text);
  }

  selectAll = () => {
    this.getInput().type('{selectAll}');
  }

  tapFormatButton = (index: number) => {
    let selector = `.edit-component:nth-of-type(${this.index}) > span > button:nth-of-type(${index})`;
    cy.get(selector).click();
  };
  tapBoldButton = () => this.tapFormatButton(1);
  tapItalicButton = () => this.tapFormatButton(2);
  tapUnderlineButton = () => this.tapFormatButton(3);
}
