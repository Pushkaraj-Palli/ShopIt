import { BasePage } from '../BasePage';

export class RetailerDashboardPage extends BasePage {
  async open(): Promise<void> {
    await super.open('/seller');
  }

  async isLoaded(): Promise<boolean> {
    return (await this.getCurrentUrl()).includes('/seller');
  }
}
