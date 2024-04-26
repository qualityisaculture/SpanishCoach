import { When, Then, Given } from "@badeball/cypress-cucumber-preprocessor";
import SearchPage from "../../pages/Search.page";
let searchPage: SearchPage;

Given("I am on the search page", (page: string) => {
  searchPage = new SearchPage();
  searchPage.visit();
});

When('I type {string} in the search box', (query: string) => {
  searchPage.typeQuery(query);
});

When('I switch the translation direction', () => {
  searchPage.switchTranslationDirection();
});

Then('I should see {string} in the response', (response: String) => {
  searchPage.getTranslation().should('contain', response);
});
