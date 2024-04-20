/// <reference types="Cypress" />
import SearchPage from '../pages/Search.page';
let searchPage: SearchPage;
describe('Search', () => {
  beforeEach(() => {
    searchPage = new SearchPage();
    searchPage.visit();
  });

  describe('Basic search', () => {
    it('should return "Hello" when "Hola" is searched', () => {
      searchPage.typeQuery('Hola');
      searchPage.getTranslation().should('contain', 'Hello');
    });

    it('should return "Hola" when "Hello" is searched and the translation direction is reversed', () => {
      searchPage.switchTranslationDirection();
      searchPage.typeQuery('Hello');
      searchPage.getTranslation().should('contain', 'Hola');
    });
  });

  describe('DeckDropdown', () => {
    it('should display a list of decks', () => {
      searchPage.openDeckDropdown();
      searchPage.getDeckDropdownItems().should('have.length', 3);
      searchPage.getDeckDropdownItems().eq(0).should('contain', 'default');
      searchPage.getDeckDropdownItems().eq(1).should('contain', 'deck2');
      searchPage.getDeckDropdownItems().eq(2).should('contain', 'deck3');
    });

    it('should save the translation to /addCard when the save button is clicked', () => {
      searchPage.typeQuery('Hola');
      searchPage.getTranslation().should('contain', 'Hello');
      searchPage.clickSaveToDeck();
      searchPage.getAddCardRequest().then((interception) => {
        const body = interception.request.body;
        expect(body).to.have.property('deckName', 'default');
        expect(body).to.have.property('front', 'Hola');
        expect(body).to.have.property('back', 'Hello');
      });
    });

    it('should save the translation with the english and spanish reversed when the translation direction is reversed', () => {
      searchPage.typeQuery('Hola');
      searchPage.getTranslation().should('contain', 'Hello');
      searchPage.openDeckDropdown();
      searchPage.switchSaveDirection();
      searchPage.clickSaveToDeck();
      searchPage.getAddCardRequest().then((interception) => {
        const body = interception.request.body;
        expect(body).to.have.property('deckName', 'default');
        expect(body).to.have.property('front', 'Hello');
        expect(body).to.have.property('back', 'Hola');
      });
    });

    it('should save to the selected deck when a deck is selected', () => {
      searchPage.typeQuery('Hola');
      searchPage.getTranslation().should('contain', 'Hello');
      searchPage.openDeckDropdown();
      searchPage.selectDeck('deck2');
      searchPage.clickSaveToDeck();
      searchPage.getAddCardRequest().then((interception) => {
        const body = interception.request.body;
        expect(body).to.have.property('deckName', 'deck2');
        expect(body).to.have.property('front', 'Hola');
        expect(body).to.have.property('back', 'Hello');
      });
    });
  });
});
