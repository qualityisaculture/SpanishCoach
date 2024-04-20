import { Page } from '@playwright/test';

export default class DeckDropdownComponent {
  page: Page;
  private readonly menuItemSelector = '.ant-dropdown-menu-title-content';

  constructor(page: Page) {
    this.page = page;
  };

  async tapSaveToDeck() {
    await this.page.click('.saveToDeck');
  }

  async openDropdown() {
    await this.page.click('.ant-btn-icon-only');
  }

  async selectDeck(index: number) {
    await this.page.locator(this.menuItemSelector).nth(index).click();
  }

  async getDropdownItems() {
    return this.page.locator(this.menuItemSelector);
  }

  async switchSaveDirection() {
    await this.page.click('.saveDirection');
  }
}