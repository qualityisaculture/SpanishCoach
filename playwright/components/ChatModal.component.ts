import { Page } from "@playwright/test";

export default class ChatModal {
  page: any;
  chatRequestUrls: any[];

  constructor(page: Page) {
    this.page = page;
    this.chatRequestUrls = [];
    this.setupChatResponseIntercept();
  }

  async setupChatResponseIntercept() {
    await this.page.route('**/chat?messages=**', (route) => {
      this.chatRequestUrls.push(route.request().url());
      route.fulfill({
        status: 200,
        body: 'response',
      });
    });
  }

  async tapClose() {
    await this.page.click('#close');
  }

  async getChatMessage(index: number) {
    return await this.page.locator(`.chat-message-text`).nth(index);
  }

  async getChatInput() {
    return await this.page.locator('#modalInput');
  }

  async fillChatInput(text: string) {
    await this.page.fill('#modalInput', text);
  }

  async tapSend() {
    await this.page.click('#modal > button');
  }

  async getChatRequestUrl(index: number =0) {
    return decodeURIComponent(this.chatRequestUrls[index]);
  }
}
