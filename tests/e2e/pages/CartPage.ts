import { By, WebElement } from 'selenium-webdriver';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  async open(): Promise<void> {
    await super.open('/cart');
  }

  async isEmpty(): Promise<boolean> {
    return await this.isVisible('cart-empty-message', 3000);
  }

  async getCartItems(): Promise<WebElement[]> {
    return await this.driver.findElements(this.byId('cart-item'));
  }

  async getItemCount(): Promise<number> {
    const items = await this.getCartItems();
    return items.length;
  }

  async getItemName(): Promise<string> {
    return await this.text('cart-item-name');
  }

  async getItemQuantity(): Promise<string> {
    return await this.text('cart-item-qty');
  }

  async increaseQuantity(): Promise<void> {
    await this.click('cart-item-qty-increase');
  }

  async decreaseQuantity(): Promise<void> {
    await this.click('cart-item-qty-decrease');
  }

  async removeItem(): Promise<void> {
    await this.click('cart-item-remove');
  }

  async clearCart(): Promise<void> {
    await this.click('clear-cart-btn');
  }

  async getSubtotal(): Promise<string> {
    return await this.text('cart-subtotal');
  }

  async getTotal(): Promise<string> {
    return await this.text('cart-total');
  }

  async checkout(): Promise<void> {
    await this.click('checkout-btn');
  }
}
