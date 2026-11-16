import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  async open(): Promise<void> {
    await super.open('/checkout');
  }
}
