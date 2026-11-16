import { expect } from 'chai';
import { WebDriver } from 'selenium-webdriver';
import { createDriver } from '../config/driver';
import { BasePage } from '../pages/BasePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { HomePage } from '../pages/HomePage';
import { logout } from '../helpers/auth';
import { ENV } from '../config/env';

describe('Authentication Flow', function () {
  this.timeout(60000);
  let driver: WebDriver;
  let loginPage: LoginPage;
  let registerPage: RegisterPage;
  let homePage: HomePage;
  let basePage: BasePage;

  before(async () => {
    driver = await createDriver();
    loginPage = new LoginPage(driver);
    registerPage = new RegisterPage(driver);
    homePage = new HomePage(driver);
    basePage = new BasePage(driver);
  });

  beforeEach(async () => {
    await logout(driver);
  });

  afterEach(async function () {
    if (this.currentTest && this.currentTest.state === 'failed') {
      try {
        const testName = this.currentTest.title.replace(/[^a-z0-9]/gi, '_');
        await basePage.takeScreenshot(`auth_${testName}`);
      } catch {}
    }
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it('shows validation errors when submitting empty login form', async () => {
    await loginPage.open();
    await loginPage.submit();
    const hasEmailErr = await loginPage.hasEmailError();
    expect(hasEmailErr).to.be.true;
  });

  it('shows error or denies login with wrong password', async () => {
    await loginPage.open();
    await loginPage.fillForm(ENV.USERS.customer.email, 'WrongPassword123!');
    await loginPage.submit();

    // Verify user remains on login page or sees error
    const url = await driver.getCurrentUrl();
    expect(url).to.include('/account/login');
  });

  it('successfully logs in with valid customer credentials', async () => {
    await loginPage.open();
    await loginPage.fillForm(ENV.USERS.customer.email, ENV.USERS.customer.password);
    await loginPage.submit();

    // After login, redirected away from /login
    await basePage.waitForUrlMatches(/^(?!.*\/account\/login).*$/);
    const url = await driver.getCurrentUrl();
    expect(url).to.not.include('/account/login');
  });

  it('redirects guest accessing protected route /account to /account/login with next param', async () => {
    await driver.get(`${ENV.BASE_URL}/account`);
    await basePage.waitForUrl('/account/login');
    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.include('/account/login');
    expect(currentUrl).to.include('next=%2Faccount');
  });

  it('validates registration form required fields', async () => {
    await registerPage.open();
    await registerPage.click('register-submit');
    const hasNameErr = await registerPage.isVisible('register-name-error');
    const hasEmailErr = await registerPage.isVisible('register-email-error');
    expect(hasNameErr || hasEmailErr).to.be.true;
  });

  it('registers a new unique customer and redirects', async () => {
    const timestamp = Date.now();
    const uniqueEmail = `newcustomer_${timestamp}@test.com`;

    await registerPage.open();
    await registerPage.register(`New User ${timestamp}`, uniqueEmail, 'Password123!', 'Password123!', true);

    // After registration, redirected to home page
    await basePage.waitForUrlMatches(/^(?!.*\/account\/register).*$/);
    const url = await driver.getCurrentUrl();
    expect(url).to.not.include('/account/register');
  });
});
