import { By, WebElement } from 'selenium-webdriver';
import { BasePage } from '../BasePage';

export class RetailerProductsPage extends BasePage {
  async open(): Promise<void> {
    await super.open('/seller/products');
  }

  async getProductCards(): Promise<WebElement[]> {
    return await this.driver.findElements(this.byId('seller-product-card'));
  }

  async getProductTitles(): Promise<string[]> {
    const elements = await this.driver.findElements(this.byId('seller-product-title'));
    const titles: string[] = [];
    for (const el of elements) {
      titles.push(await el.getText());
    }
    return titles;
  }

  async archiveFirstProduct(): Promise<void> {
    await this.click('archive-seller-product');
  }

  async isProductListVisible(): Promise<boolean> {
    return await this.isVisible('seller-products-list');
  }

  async isEmpty(): Promise<boolean> {
    return await this.isVisible('seller-products-empty');
  }
}
