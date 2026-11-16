import { By } from 'selenium-webdriver';
import { BasePage } from '../BasePage';

export class RetailerProductFormPage extends BasePage {
  async openNew(): Promise<void> {
    await super.open('/seller/products/new');
  }

  async openEdit(productId: string): Promise<void> {
    await super.open(`/seller/products/${productId}/edit`);
  }

  async fillForm(details: {
    name: string;
    description: string;
    categorySlug: string;
    price: string;
    stock: string;
    image: string;
  }): Promise<void> {
    await this.type('retailer-product-title', details.name);
    await this.type('retailer-product-description', details.description);

    // Click matching option in category select
    const option = await this.driver.findElement(
      By.css(`[data-testid="retailer-product-category"] option[value="${details.categorySlug}"]`)
    );
    await option.click();

    await this.type('retailer-product-price', details.price);
    await this.type('retailer-product-stock', details.stock);
    await this.type('retailer-product-image', details.image);
  }

  async submit(): Promise<void> {
    await this.click('retailer-product-save');
  }
}
