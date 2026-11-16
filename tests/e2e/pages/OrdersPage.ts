import { BasePage } from './BasePage';

export class OrdersPage extends BasePage {
  async open(): Promise<void> {
    await super.open('/account/orders');
  }
}
