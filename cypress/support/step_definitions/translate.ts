import { When, Then, Given, Before, DataTable } from "@badeball/cypress-cucumber-preprocessor";
import SearchPage from "../../pages/Search.page";
let searchPage: SearchPage;

function asObjects(data: DataTable) {
  let returnArray: any[] = [];
  let headers = data.raw()[0];
  let rows = data.raw().slice(1);
  rows.forEach((row) => {
    let obj = {};
    for (let i = 0; i < headers.length; i++) {
      obj[headers[i]] = row[i];
    }
    returnArray.push(obj);
  });
  return returnArray;
}

Before(() => {
  searchPage = new SearchPage();
});

Given("I am on the search page", (page: string) => {
  searchPage.visit();
});

When('I type {string} in the search box', (query: string) => {
  searchPage.typeQuery(query);
});

When('I switch the translation direction', () => {
  searchPage.switchTranslationDirection();
});

When('I set the translation direction to {string}', (direction: string) => {
  if (direction === 'E->S') {
    searchPage.switchTranslationDirection();
  }
});


When('I open the deck dropdown', () => {
  searchPage.openDeckDropdown();
});

When('I select {string}', (deck: string) => {
  searchPage.selectDeck(deck);
});

When('I switch the save direction', () => {
  searchPage.switchSaveDirection();
});

When('I set the save direction to {string}', (direction: string) => {
  if (direction === 'S->E') {
    searchPage.switchSaveDirection();
  }
});

When('I click the save button', () => {
  searchPage.clickSaveToDeck();
});

Then('I should see {string} in the response', (response: String) => {
  searchPage.getTranslation().should('contain', response);
});

Then('I should see a list of the following decks:', (decks: DataTable) => {
  let data: string[] = decks.raw()[0];
  searchPage.getDeckDropdownItems().should('have.length', data.length);
  data.forEach((deck: string, index: number) => {
    searchPage.getDeckDropdownItems().eq(index).should('contain', deck);
  });
});

Then('I should see the following request in the add card request:', (request: DataTable) => {
  let data: string[] = request.raw()[0];
  searchPage.getAddCardRequest().then((interception) => {
    const body = interception.request.body;
    expect(body).to.have.property('deckName', data[0]);
    expect(body).to.have.property('front', data[1]);
    expect(body).to.have.property('back', data[2]);
  });
});

Then(/I should see a POST request to \/addCard with the following body:/, (request: DataTable) => {
  let data = asObjects(request);
  searchPage.getAddCardRequest().then((interception) => {
    const body = interception.request.body;
    expect(body).to.have.property('deckName', data[0].deckName);
    expect(body).to.have.property('front', data[0].front);
    expect(body).to.have.property('back', data[0].back);
  });
});

