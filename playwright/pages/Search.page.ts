import { Page } from "@playwright/test";
import { addCardResponseType, decksResponseType } from "../../src/server/routes/anki";
import { translateResponseType } from "../../src/server/routes/translator";
import DeckDropdownComponent from "../components/DeckDropdown.component";

export default class SearchPage {
  private page: Page;
  addCardRequests: any;
  deckDropdown: DeckDropdownComponent;

  constructor(page: Page) {
    this.page = page;
    this.addCardRequests = [];
    this.deckDropdown = new DeckDropdownComponent(page);
    this.setupTranslationIntercept();
    this.setupDecksIntercept();
    this.setupAddCardIntercept();
  }

  async setupTranslationIntercept() {
    let englishResponse: translateResponseType = {
      english: 'Hello',
    };
    await this.page.route('*/**/translate?spanish=Hola', async (route) => {
      const json = englishResponse;
      await route.fulfill({ json });
    });
    let spanishResponse: translateResponseType = {
      spanish: 'Hola',
    };
    await this.page.route('*/**/translate?english=Hello', async (route) => {
      const json = spanishResponse;
      await route.fulfill({ json });
    });
  }

  async setupDecksIntercept() {
    let response: decksResponseType = {
      result: ['default', 'deck2', 'deck3'],
    };
    await this.page.route('*/**/decks', async (route) => {
      const json = response;
      await route.fulfill({ json });
    });
  }

  async setupAddCardIntercept() {
    let response: addCardResponseType = {
      success: true,
      message: null,
    };
    await this.page.route('*/**/addCard', async (route) => {
      this.addCardRequests.push(route.request().postData());
      const json = response;
      await route.fulfill({ json });
    });
  }

  async visit() {
    await this.page.goto('http://127.0.0.1:8080/search');
  }

  async enterQuery(text: string) {
    await this.page.fill('.translationInput textarea', text);
  }

  async switchTranslationDirection() {
    await this.page.click('.translationDirection');
  }

  async getResult() {
    return this.page.locator('.translationOutput')
  }

  async clickSaveToDeck() {
    await this.deckDropdown.tapSaveToDeck();
  }

  async openDeckDropdown() {
    await this.deckDropdown.openDropdown();
  }

  async selectDeck(index: number) {
    await this.deckDropdown.selectDeck(index);
  }

  async getDeckDropdownItems() {
    return this.deckDropdown.getDropdownItems();
  }

  async switchSaveDirection() {
    await this.deckDropdown.switchSaveDirection();
  }

  getAddCardRequest(index: number = 0) {
    return JSON.parse(this.addCardRequests[index]);
  }


}
