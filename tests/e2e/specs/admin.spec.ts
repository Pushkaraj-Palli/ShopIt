import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';
import { createDriver } from '../config/driver';
import { BasePage } from '../pages/BasePage';
import { AdminRetailersPage } from '../pages/admin/AdminRetailersPage';
import { AdminProductsPage } from '../pages/admin/AdminProductsPage';
import { loginAs } from '../helpers/auth';

describe('Admin Moderation Console', function () {
  this.timeout(60000);
  let driver: WebDriver;
  let retailersPage: AdminRetailersPage;
  let productsPage: AdminProductsPage;
  let basePage: BasePage;

  before(async () => {
    driver = await createDriver();
    retailersPage = new AdminRetailersPage(driver);
    productsPage = new AdminProductsPage(driver);
    basePage = new BasePage(driver);
  });

  beforeEach(async () => {
    await loginAs(driver, 'admin');
  });

  afterEach(async function () {
    if (this.currentTest && this.currentTest.state === 'failed') {
      try {
        const testName = this.currentTest.title.replace(/[^a-z0-9]/gi, '_');
        await basePage.takeScreenshot(`admin_${testName}`);
      } catch {}
    }
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it('renders pending seller applications in the admin console', async () => {
    await retailersPage.open();
    const hasApps = await retailersPage.hasApplications();
    const isEmpty = await basePage.isVisible('seller-applications-empty');
    expect(hasApps || isEmpty).to.be.true;
  });

  it('renders products awaiting review in admin moderation', async () => {
    await productsPage.open();
    const hasProducts = await productsPage.hasProductsForReview();
    const isEmpty = await basePage.isVisible('product-review-empty');
    expect(hasProducts || isEmpty).to.be.true;
  });

  it('approves a pending product when available in the moderation queue', async () => {
    await productsPage.open();
    const hasProducts = await productsPage.hasProductsForReview();
    if (hasProducts) {
      await productsPage.approveFirstProduct();
      const notice = await productsPage.getNotice();
      expect(notice).to.include('approved');
    }
  });
});
