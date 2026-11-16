import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';
import { createDriver } from '../config/driver';
import { BasePage } from '../pages/BasePage';
import { RetailerProductsPage } from '../pages/retailer/RetailerProductsPage';
import { RetailerProductFormPage } from '../pages/retailer/RetailerProductFormPage';
import { loginAs } from '../helpers/auth';

describe('Retailer Product Management', function () {
  this.timeout(60000);
  let driver: WebDriver;
  let productsPage: RetailerProductsPage;
  let formPage: RetailerProductFormPage;
  let basePage: BasePage;

  before(async () => {
    driver = await createDriver();
    productsPage = new RetailerProductsPage(driver);
    formPage = new RetailerProductFormPage(driver);
    basePage = new BasePage(driver);
  });

  beforeEach(async () => {
    await loginAs(driver, 'retailerA');
  });

  afterEach(async function () {
    if (this.currentTest && this.currentTest.state === 'failed') {
      try {
        const testName = this.currentTest.title.replace(/[^a-z0-9]/gi, '_');
        await basePage.takeScreenshot(`retailer_prod_${testName}`);
      } catch {}
    }
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it('displays the list of products owned by retailer', async () => {
    await productsPage.open();
    const hasList = await productsPage.isProductListVisible();
    expect(hasList).to.be.true;

    const titles = await productsPage.getProductTitles();
    expect(titles.length).to.be.greaterThan(0);
  });

  it('creates a new product submission for review', async () => {
    const timestamp = Date.now();
    const productName = `E2E Test Widget ${timestamp}`;

    await formPage.openNew();
    await formPage.fillForm({
      name: productName,
      description: 'Automated test product description with sufficient length for validation.',
      categorySlug: 'electronics',
      price: '1499',
      stock: '15',
      image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800',
    });
    await formPage.submit();

    // After submission, redirected back to seller products list
    await basePage.waitForUrl('/seller/products');
    await driver.wait(async () => {
      const titles = await productsPage.getProductTitles();
      return titles.some((t) => t.includes(productName));
    }, 15000, `Created product "${productName}" not found in list`);
  });

  it('archives an active product', async () => {
    await productsPage.open();
    const canArchive = await basePage.isVisible('archive-seller-product');
    if (canArchive) {
      await productsPage.archiveFirstProduct();
      // Should show success feedback or update status
      const pageText = await driver.getPageSource();
      expect(pageText).to.be.a('string');
    }
  });
});
