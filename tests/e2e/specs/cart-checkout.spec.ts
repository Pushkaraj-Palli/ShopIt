import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';
import { createDriver } from '../config/driver';
import { BasePage } from '../pages/BasePage';
import { CartPage } from '../pages/CartPage';
import { ProductListPage } from '../pages/ProductListPage';

describe('Cart & Checkout Flow', function () {
  this.timeout(60000);
  let driver: WebDriver;
  let cartPage: CartPage;
  let productListPage: ProductListPage;
  let basePage: BasePage;

  before(async () => {
    driver = await createDriver();
    cartPage = new CartPage(driver);
    productListPage = new ProductListPage(driver);
    basePage = new BasePage(driver);
  });

  afterEach(async function () {
    if (this.currentTest && this.currentTest.state === 'failed') {
      try {
        const testName = this.currentTest.title.replace(/[^a-z0-9]/gi, '_');
        await basePage.takeScreenshot(`cart_${testName}`);
      } catch {}
    }
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it('navigates to shop, selects a product and adds it to cart', async () => {
    await productListPage.open();
    await productListPage.waitForUrl('/shop');
    await productListPage.clickFirstProduct();

    await basePage.waitForUrl('/product/');
    await basePage.click('product-detail-add-to-cart');

    await cartPage.waitForUrl('/cart');
    const itemCount = await cartPage.getItemCount();
    expect(itemCount).to.be.greaterThan(0);

    const subtotal = await cartPage.getSubtotal();
    expect(subtotal).to.be.a('string');
  });

  it('increments item quantity in cart', async () => {
    const initialQty = parseInt(await cartPage.getItemQuantity(), 10);
    await cartPage.increaseQuantity();

    await driver.wait(async () => {
      const currentQty = parseInt(await cartPage.getItemQuantity(), 10);
      return currentQty === initialQty + 1;
    }, 10000, 'Cart item quantity did not increment');

    const newQty = parseInt(await cartPage.getItemQuantity(), 10);
    expect(newQty).to.equal(initialQty + 1);
  });

  it('removes the item from cart and verifies empty cart message', async () => {
    await cartPage.removeItem();

    await driver.wait(async () => {
      return await cartPage.isEmpty();
    }, 10000, 'Cart did not display empty state after item removal');

    const isEmpty = await cartPage.isEmpty();
    expect(isEmpty).to.be.true;
  });
});
