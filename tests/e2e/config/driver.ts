import { Builder, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { ENV } from './env';

export async function createDriver(): Promise<WebDriver> {
  const options = new chrome.Options();

  if (ENV.HEADLESS) {
    options.addArguments('--headless=new');
  }

  options.addArguments(
    '--window-size=1440,900',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-extensions',
    '--ignore-certificate-errors',
    '--allow-insecure-localhost'
  );

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  // Explicit waits only - avoid implicit wait conflicts
  await driver.manage().setTimeouts({
    implicit: 0,
    pageLoad: 30000,
    script: 15000,
  });

  return driver;
}
