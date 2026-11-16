import fs from 'fs';
import path from 'path';
import { By, until, WebDriver, WebElement } from 'selenium-webdriver';
import { ENV } from '../config/env';

export class BasePage {
  constructor(
    public readonly driver: WebDriver,
    protected readonly timeout: number = ENV.DEFAULT_TIMEOUT
  ) {}

  protected byId(id: string) {
    return By.css(`[data-testid="${id}"]`);
  }

  async el(id: string, customTimeout?: number): Promise<WebElement> {
    const to = customTimeout ?? this.timeout;
    const element = await this.driver.wait(until.elementLocated(this.byId(id)), to, `Element [data-testid="${id}"] not located after ${to}ms`);
    await this.driver.wait(until.elementIsVisible(element), to, `Element [data-testid="${id}"] not visible after ${to}ms`);
    return element;
  }

  async click(id: string, customTimeout?: number): Promise<void> {
    const to = customTimeout ?? this.timeout;
    await this.driver.wait(async () => {
      try {
        const element = await this.el(id, to);
        await element.click();
        return true;
      } catch (err: any) {
        if (err.name === 'StaleElementReferenceError') return false;
        throw err;
      }
    }, to, `Failed to click [data-testid="${id}"] within ${to}ms`);
  }

  async type(id: string, text: string, customTimeout?: number): Promise<void> {
    const to = customTimeout ?? this.timeout;
    await this.driver.wait(async () => {
      try {
        const element = await this.el(id, to);
        await element.clear();
        await element.sendKeys(text);
        return true;
      } catch (err: any) {
        if (err.name === 'StaleElementReferenceError') return false;
        throw err;
      }
    }, to, `Failed to type into [data-testid="${id}"] within ${to}ms`);
  }

  async text(id: string, customTimeout?: number): Promise<string> {
    const element = await this.el(id, customTimeout);
    return await element.getText();
  }

  async getValue(id: string, customTimeout?: number): Promise<string> {
    const element = await this.el(id, customTimeout);
    return (await element.getAttribute('value')) || '';
  }

  async isVisible(id: string, customTimeout = 2000): Promise<boolean> {
    try {
      const element = await this.driver.wait(until.elementLocated(this.byId(id)), customTimeout);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  async open(pagePath: string): Promise<void> {
    const fullUrl = `${ENV.BASE_URL}${pagePath.startsWith('/') ? pagePath : `/${pagePath}`}`;
    await this.driver.get(fullUrl);
  }

  async getCurrentUrl(): Promise<string> {
    return await this.driver.getCurrentUrl();
  }

  async waitForUrl(urlPart: string, customTimeout?: number): Promise<boolean> {
    const to = customTimeout ?? this.timeout;
    return await this.driver.wait(until.urlContains(urlPart), to, `URL did not contain "${urlPart}" after ${to}ms`);
  }

  async waitForUrlMatches(pattern: RegExp, customTimeout?: number): Promise<boolean> {
    const to = customTimeout ?? this.timeout;
    return await this.driver.wait(until.urlMatches(pattern), to, `URL did not match ${pattern} after ${to}ms`);
  }

  async takeScreenshot(fileName: string): Promise<string> {
    const screenshotsDir = path.resolve(process.cwd(), 'reports', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    const filePath = path.join(screenshotsDir, `${Date.now()}-${fileName}.png`);
    const image = await this.driver.takeScreenshot();
    fs.writeFileSync(filePath, image, 'base64');
    return filePath;
  }
}
