import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';
import { createDriver } from '../config/driver';
import { BasePage } from '../pages/BasePage';
import { ProductListPage } from '../pages/ProductListPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { SEED_IDS } from '../helpers/seed';
import { ENV } from '../config/env';

describe('Storefront Catalogue', function () {
  this.timeout(60000);
  let driver: WebDriver;
  let productListPage: ProductListPage;
  let productDetailPage: ProductDetailPage;
  let basePage: BasePage;

  before(async () => {
    driver = await createDriver();
    productListPage = new ProductListPage(driver);
    productDetailPage = new ProductDetailPage(driver);
    basePage = new BasePage(driver);
  });

  afterEach(async function () {
    if (this.currentTest && this.currentTest.state === 'failed') {
      try {
        const testName = this.currentTest.title.replace(/[^a-z0-9]/gi, '_');
        await basePage.takeScreenshot(`catalogue_${testName}`);
      } catch {}
    }
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it('renders catalogue products in the shop page', async () => {
    await productListPage.open();
    const count = await productListPage.getProductCount();
    expect(count).to.be.greaterThan(0);
  });

  it('searches for a product by name and filters the grid', async () => {
    await productListPage.open();
    await productListPage.search('Earbuds');
    const cards = await productListPage.getProductCards();
    expect(cards.length).to.be.greaterThan(0);

    const firstTitle = await basePage.text('product-title');
    expect(firstTitle.toLowerCase()).to.include('earbuds');
  });

  it('shows no products found message for non-existent search query', async () => {
    await productListPage.open();
    await productListPage.search('xyzNonExistentProduct123456');
    const noProducts = await productListPage.isNoProductsFound();
    expect(noProducts).to.be.true;
  });

  it('filters products by category via URL parameter', async () => {
    await driver.get(`${ENV.BASE_URL}/shop?category=clothing`);
    const count = await productListPage.getProductCount();
    expect(count).to.be.greaterThan(0);
  });

  it('displays accurate stock info on product detail page for out of stock item', async () => {
    const outOfStockId = SEED_IDS.products.retailerA_outOfStock.toString();
    await productDetailPage.open(outOfStockId);

    const stockText = await productDetailPage.getStock();
    expect(stockText).to.include('0 in stock');
  });

  it('displays accurate stock info for single unit item', async () => {
    const singleStockId = SEED_IDS.products.retailerA_singleStock.toString();
    await productDetailPage.open(singleStockId);

    const stockText = await productDetailPage.getStock();
    expect(stockText).to.include('1 in stock');
  });
});
