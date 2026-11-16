import { BasePage } from '../BasePage';

export class RetailerOrdersPage extends BasePage {
  async open(): Promise<void> {
    await super.open('/seller/orders');
  }
}
