import { Page } from '@playwright/test';

export default class EditComponent {
  page: Page;
  index: number;

  constructor(page: Page, index: number) {
    this.page = page;
    this.index = index;
  }

  async getInput() {
    return this.page.locator('.edit-component:nth-of-type(' + this.index + ') > input');
  }

  async fillInput(text: string) {
    await (await this.getInput()).fill(text);
  }

  async selectAll() {
    await (await this.getInput()).selectText();
  }

  async formatButton(index: number) {
    return this.page.locator(
      '.edit-component:nth-of-type(' + this.index + ') > div > button:nth-of-type(' + index + ')'
    );
  }

  async tapBold() {
    await (await this.formatButton(1)).click();
  }

  async tapItalic() {
    await (await this.formatButton(2)).click();
  }

  async tapUnderline() {
    await (await this.formatButton(3)).click();
  }
}
