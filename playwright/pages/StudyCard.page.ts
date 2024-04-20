import { Page } from '@playwright/test';
import EditComponent from '../components/Edit.component';

export default class StudyCard {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
    this.setupDueCardsIntercept();
    this.setupSaveCardIntercept();
  }

  async setupDueCardsIntercept() {
    let response = {
      new: [
        {
          id: 1,
          noteId: 1,
          front: 'new card',
          back: 'new card back',
          failInterval: '0',
          hardInterval: '0',
          mediumInterval: '0',
          easyInterval: '0',
          due: 0,
          isNew: true,
          leftToStudy: 0,
        },
      ],
      learn: [
        {
          id: 2,
          noteId: 2,
          front: 'learn card',
          back: 'learn card back',
          failInterval: '0',
          hardInterval: '0',
          mediumInterval: '0',
          easyInterval: '0',
          due: 0,
          isNew: true,
          leftToStudy: 0,
        },
      ],
      due: [
        {
          id: 4,
          noteId: 4,
          front: 'due card',
          back: 'due card back',
          failInterval: '0',
          hardInterval: '0',
          mediumInterval: '0',
          easyInterval: '0',
          due: 0,
          isNew: true,
          leftToStudy: 0,
        },
      ],
    };
    await this.page.route('*/**/dueCards?deck=deck1', async (route) => {
      const json = response;
      await route.fulfill({ json });
    });
  }

  async setupSaveCardIntercept() {
    let response = {
      success: true,
      message: null,
    };
    this.page.route('*/**/updateCard', async (route) => {
      await route.fulfill({ json: response });
    });
  }

  async tapBack() {
    await this.page.click('#back');
  }

  async tapEdit() {
    await this.page.click('#edit');
  }

  async tapSave() {
    await this.page.click('#save');
  }

  async tapCancel() {
    await this.page.click('#cancel');
  }

  async getCardFront() {
    return this.page.locator('.card-front');
  }

  getCardFrontEditComponent() {
    return new EditComponent(this.page, 1);
  }

  async getCardBack() {
    return this.page.locator('.card-back');
  }

  getCardBackEditComponent() {
    return new EditComponent(this.page, 3);
  }

  async tapCard() {
    await this.page.click('.card');
  }

  async getCard() {
    return this.page.locator('.card');
  }

  async tapModalButton() {
    await this.page.click('.modal-button');
  }

  async tapAnswerEasy() {
    await this.page.click('#answer-easy');
  }
}
