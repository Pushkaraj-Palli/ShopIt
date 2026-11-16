import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  async open(): Promise<void> {
    await super.open('/');
  }

  async isQuickAuthVisible(): Promise<boolean> {
    return await this.isVisible('quick-auth-btn');
  }

  async isUserMenuVisible(): Promise<boolean> {
    return await this.isVisible('user-menu-btn');
  }

  async openUserMenu(): Promise<void> {
    await this.click('user-menu-btn');
  }

  async logout(): Promise<void> {
    await this.openUserMenu();
    await this.click('nav-logout');
  }

  async goToCart(): Promise<void> {
    await this.click('nav-cart');
  }

  async hasProductCards(): Promise<boolean> {
    return await this.isVisible('product-card');
  }
}
