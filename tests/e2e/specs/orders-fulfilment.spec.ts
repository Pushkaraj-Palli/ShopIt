import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';
import { createDriver } from '../config/driver';
import { BasePage } from '../pages/BasePage';
import { OrdersPage } from '../pages/OrdersPage';
import { RetailerOrdersPage } from '../pages/retailer/RetailerOrdersPage';
import { loginAs, logout } from '../helpers/auth';

describe('Orders & Fulfilment Flow', function () {
  this.timeout(60000);
  let driver: WebDriver;
  let customerOrdersPage: OrdersPage;
  let retailerOrdersPage: RetailerOrdersPage;
  let basePage: BasePage;

  before(async () => {
    driver = await createDriver();
    customerOrdersPage = new OrdersPage(driver);
    retailerOrdersPage = new RetailerOrdersPage(driver);
    basePage = new BasePage(driver);
  });

  afterEach(async function () {
    if (this.currentTest && this.currentTest.state === 'failed') {
      try {
        const testName = this.currentTest.title.replace(/[^a-z0-9]/gi, '_');
        await basePage.takeScreenshot(`orders_${testName}`);
      } catch {}
    }
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it('redirects guest accessing orders to login', async () => {
    await logout(driver);
    await customerOrdersPage.open();
    await basePage.waitForUrl('/account/login');
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/account/login');
  });

  it('allows authenticated customer to view orders area', async () => {
    await loginAs(driver, 'customer');
    await customerOrdersPage.open();
    await basePage.waitForUrlMatches(/(\/account\/orders|\/account)/);
    const url = await driver.getCurrentUrl();
    expect(url).to.not.include('/account/login');
  });

  it('allows retailer to view seller orders area', async () => {
    await loginAs(driver, 'retailerA');
    await retailerOrdersPage.open();
    await basePage.waitForUrlMatches(/(\/seller\/orders|\/seller)/);
    const url = await driver.getCurrentUrl();
    expect(url).to.not.include('/account/login');
  });
});
