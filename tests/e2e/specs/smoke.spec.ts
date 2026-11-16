import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';
import { createDriver } from '../config/driver';
import { BasePage } from '../pages/BasePage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { ProductListPage } from '../pages/ProductListPage';
import { CartPage } from '../pages/CartPage';

describe('Smoke Test Suite', function () {
  this.timeout(60000);
  let driver: WebDriver;
  let homePage: HomePage;
  let loginPage: LoginPage;
  let productListPage: ProductListPage;
  let cartPage: CartPage;
  let basePage: BasePage;

  before(async () => {
    driver = await createDriver();
    homePage = new HomePage(driver);
    loginPage = new LoginPage(driver);
    productListPage = new ProductListPage(driver);
    cartPage = new CartPage(driver);
    basePage = new BasePage(driver);
  });

  afterEach(async function () {
    if (this.currentTest && this.currentTest.state === 'failed') {
      try {
        const testName = this.currentTest.title.replace(/[^a-z0-9]/gi, '_');
        await basePage.takeScreenshot(`smoke_${testName}`);
      } catch {}
    }
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it('loads the home page and verifies brand and navigation', async () => {
    await homePage.open();
    const url = await homePage.getCurrentUrl();
    expect(url).to.include('/');
  });

  it('renders the login page correctly', async () => {
    await loginPage.open();
    const url = await loginPage.getCurrentUrl();
    expect(url).to.include('/account/login');
    const hasSubmit = await loginPage.isVisible('login-submit');
    expect(hasSubmit).to.be.true;
  });

  it('navigates to shop and opens a product detail page', async () => {
    await productListPage.open();
    await productListPage.waitForUrl('/shop');
    const count = await productListPage.getProductCount();
    expect(count).to.be.greaterThan(0);

    await productListPage.clickFirstProduct();
    await basePage.waitForUrl('/product/');
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/product/');
  });

  it('adds the product to cart from product detail page', async () => {
    const hasAddBtn = await basePage.isVisible('product-detail-add-to-cart');
    if (hasAddBtn) {
      await basePage.click('product-detail-add-to-cart');
      await basePage.waitForUrl('/cart');
      const url = await driver.getCurrentUrl();
      expect(url).to.include('/cart');
      const itemCount = await cartPage.getItemCount();
      expect(itemCount).to.be.greaterThan(0);
    }
  });
});
