import { BasePage } from '../BasePage';

export class AdminProductsPage extends BasePage {
  async open(): Promise<void> {
    await super.open('/admin/products');
  }

  async hasProductsForReview(): Promise<boolean> {
    return await this.isVisible('product-review-card');
  }

  async approveFirstProduct(): Promise<void> {
    await this.click('approve-product');
  }

  async rejectFirstProduct(reason: string): Promise<void> {
    await this.type('product-rejection-reason', reason);
    await this.click('reject-product');
  }

  async getNotice(): Promise<string> {
    return await this.text('product-review-notice');
  }
}
