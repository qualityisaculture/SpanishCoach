import { Page } from '@playwright/test';

export default class StudyMenu {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
    this.setupDecksIntercept();
  }

  async setupDecksIntercept() {
    let response = {
      result: {
        deck1: {
          deck_id: 1,
          name: 'deck1',
          new_count: 1,
          learn_count: 2,
          review_count: 3,
          total_in_deck: 6,
        },
        deck2: {
          deck_id: 2,
          name: 'deck2',
          new_count: 2,
          learn_count: 4,
          review_count: 6,
          total_in_deck: 12,
        },
        deck3: {
          deck_id: 3,
          name: 'deck3',
          new_count: 3,
          learn_count: 6,
          review_count: 9,
          total_in_deck: 18,
        },
      },
      error: null,
    };
    await this.page.route('*/**/allDecksWithStats', async (route) => {
      const json = response;
      await route.fulfill({ json });
    });
  }

  async visit() {
    await this.page.goto('http://127.0.0.1:8080/study');
  }

  async tapDeck(index: number) {
    const deckRows = await this.getDeckRows();
    await deckRows.nth(index).click();
  }

  async getDeckRows() {
    return this.page.locator('.deck-row');
  }
}
