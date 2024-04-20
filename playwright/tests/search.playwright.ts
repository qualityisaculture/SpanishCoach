import { test, expect } from '@playwright/test';
import SearchPage from '../pages/Search.page';

let searchPage: SearchPage;
test.beforeEach(async ({ page }) => {
  searchPage = new SearchPage(page);
  await searchPage.visit();
});

test.describe('Basic search', () => {
  test('should return "Hello" when "Hola" is searched', async () => {
    await searchPage.enterQuery('Hola');
    await expect(await searchPage.getResult()).toContainText('Hello');
  });

  test('should return "Hola" when "Hello" is searched and the translation direction is reversed', async () => {
    await searchPage.switchTranslationDirection();
    await searchPage.enterQuery('Hello');
  });
});

test.describe('Deck Dropdown', () => {
  test('should display the decks in the dropdown', async () => {
    await searchPage.openDeckDropdown();
    let items = await searchPage.getDeckDropdownItems();
    await expect(items).toHaveCount(3);
    await expect(items.nth(0)).toContainText('default');
    await expect(items.nth(1)).toContainText('deck2');
    await expect(items.nth(2)).toContainText('deck3');
  });

  test('should save the translation to /addCard when the save button is clicked', async () => {
    await searchPage.enterQuery('Hola');
    await expect(await searchPage.getResult()).toContainText('Hello');
    await searchPage.clickSaveToDeck();

    const request = searchPage.getAddCardRequest();
    expect(request).toHaveProperty('deckName', 'default');
    expect(request).toHaveProperty('front', 'Hola');
    expect(request).toHaveProperty('back', 'Hello');
  });

  test('should save the translation with the english and spanish reversed when the translation direction is reversed', async () => {
    await searchPage.enterQuery('Hola');
    await expect(await searchPage.getResult()).toContainText('Hello');
    await searchPage.openDeckDropdown();
    await searchPage.switchSaveDirection();
    await searchPage.clickSaveToDeck();

    const request = searchPage.getAddCardRequest();
    expect(request).toHaveProperty('deckName', 'default');
    expect(request).toHaveProperty('front', 'Hello');
    expect(request).toHaveProperty('back', 'Hola');
  });

  test('should save to the selected deck when a deck is selected', async () => {
    await searchPage.enterQuery('Hola');
    await expect(await searchPage.getResult()).toContainText('Hello');
    await searchPage.openDeckDropdown();
    await searchPage.selectDeck(1);
    await searchPage.clickSaveToDeck();

    const request = searchPage.getAddCardRequest();
    expect(request).toHaveProperty('deckName', 'deck2');
    expect(request).toHaveProperty('front', 'Hola');
    expect(request).toHaveProperty('back', 'Hello');
  });
});
