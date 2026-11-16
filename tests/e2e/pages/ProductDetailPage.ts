import { BasePage } from './BasePage';

export class ProductDetailPage extends BasePage {
  async open(productId: string): Promise<void> {
    await super.open(`/product/${productId}`);
  }

  async getTitle(): Promise<string> {
    return await this.text('product-detail-title');
  }

  async getPrice(): Promise<string> {
    return await this.text('product-detail-price');
  }

  async getStock(): Promise<string> {
    return await this.text('product-detail-stock');
  }

  async addToCart(): Promise<void> {
    await this.click('product-detail-add-to-cart');
  }

  async increaseQuantity(): Promise<void> {
    await this.click('product-detail-qty-increase');
  }

  async decreaseQuantity(): Promise<void> {
    await this.click('product-detail-qty-decrease');
  }

  async getQuantity(): Promise<string> {
    return await this.text('product-detail-qty-value');
  }
}
