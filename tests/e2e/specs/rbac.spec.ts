import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';
import { createDriver } from '../config/driver';
import { BasePage } from '../pages/BasePage';
import { loginAs, logout } from '../helpers/auth';
import { SEED_IDS } from '../helpers/seed';
import { ENV } from '../config/env';

describe('RBAC & Permission Denials', function () {
  this.timeout(60000);
  let driver: WebDriver;
  let basePage: BasePage;

  before(async () => {
    driver = await createDriver();
    basePage = new BasePage(driver);
  });

  afterEach(async function () {
    if (this.currentTest && this.currentTest.state === 'failed') {
      try {
        const testName = this.currentTest.title.replace(/[^a-z0-9]/gi, '_');
        await basePage.takeScreenshot(`rbac_${testName}`);
      } catch {}
    }
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  describe('Guest access restrictions', () => {
    beforeEach(async () => {
      await logout(driver);
    });

    const protectedPaths = ['/seller', '/admin/products', '/admin/retailers', '/account'];

    for (const path of protectedPaths) {
      it(`redirects guest from ${path} to login`, async () => {
        await driver.get(`${ENV.BASE_URL}${path}`);
        await basePage.waitForUrl('/account/login');
        const url = await driver.getCurrentUrl();
        expect(url).to.include('/account/login');
      });
    }
  });

  describe('Customer role restrictions', () => {
    beforeEach(async () => {
      await loginAs(driver, 'customer');
    });

    it('blocks customer from accessing /seller', async () => {
      await driver.get(`${ENV.BASE_URL}/seller`);
      // Middleware redirects to /api/auth/session?next=/seller, which redirects to /?access=denied or denies
      await basePage.waitForUrlMatches(/(\/account\/login|\/\?access=denied|\/login)/);
      const url = await driver.getCurrentUrl();
      expect(url).to.not.include('/seller');
    });

    it('blocks customer from accessing /admin/products', async () => {
      await driver.get(`${ENV.BASE_URL}/admin/products`);
      await basePage.waitForUrlMatches(/(\/account\/login|\/\?access=denied|\/login)/);
      const url = await driver.getCurrentUrl();
      expect(url).to.not.include('/admin');
    });
  });

  describe('Retailer role restrictions', () => {
    beforeEach(async () => {
      await loginAs(driver, 'retailerA');
    });

    it('allows retailer to access /seller', async () => {
      await driver.get(`${ENV.BASE_URL}/seller/products`);
      await basePage.waitForUrl('/seller/products');
      const url = await driver.getCurrentUrl();
      expect(url).to.include('/seller/products');
    });

    it('blocks retailer from accessing /admin/products', async () => {
      await driver.get(`${ENV.BASE_URL}/admin/products`);
      await basePage.waitForUrlMatches(/(\/account\/login|\/\?access=denied|\/login)/);
      const url = await driver.getCurrentUrl();
      expect(url).to.not.include('/admin');
    });

    it('blocks retailer A from modifying retailer B product via API call', async () => {
      // Execute in browser context while authenticated as retailer A
      const productBId = SEED_IDS.products.retailerB_active1.toString();
      const status = await driver.executeAsyncScript(
        (prodId: string, done: (status: number) => void) => {
          fetch(`/api/seller/products/${prodId}`, {
            method: 'DELETE',
          })
            .then((res) => done(res.status))
            .catch(() => done(500));
        },
        productBId
      );

      // Should be denied (403 Forbidden or 404 Not Found)
      expect([403, 404]).to.include(status);
    });
  });

  describe('Admin role permissions', () => {
    beforeEach(async () => {
      await loginAs(driver, 'admin');
    });

    it('allows admin to access /admin/products and /admin/retailers', async () => {
      await driver.get(`${ENV.BASE_URL}/admin/products`);
      await basePage.waitForUrl('/admin/products');
      let url = await driver.getCurrentUrl();
      expect(url).to.include('/admin/products');

      await driver.get(`${ENV.BASE_URL}/admin/retailers`);
      await basePage.waitForUrl('/admin/retailers');
      url = await driver.getCurrentUrl();
      expect(url).to.include('/admin/retailers');
    });
  });
});
