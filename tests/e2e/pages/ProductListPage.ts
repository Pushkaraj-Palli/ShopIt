import { By, WebElement } from 'selenium-webdriver';
import { BasePage } from './BasePage';

export class ProductListPage extends BasePage {
  async open(): Promise<void> {
    await super.open('/shop');
  }

  async search(query: string): Promise<void> {
    await this.type('search-input', query);
  }

  async clearSearch(): Promise<void> {
    await this.click('clear-search-btn');
  }

  async getProductCards(): Promise<WebElement[]> {
    return await this.driver.findElements(this.byId('product-card'));
  }

  async getProductCount(): Promise<number> {
    const cards = await this.getProductCards();
    return cards.length;
  }

  async isNoProductsFound(): Promise<boolean> {
    return await this.isVisible('no-products-found', 3000);
  }

  async clickFirstProduct(): Promise<void> {
    await this.click('product-title');
  }
}
