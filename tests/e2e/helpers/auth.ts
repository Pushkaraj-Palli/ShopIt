import jwt from 'jsonwebtoken';
import { WebDriver } from 'selenium-webdriver';
import { ENV } from '../config/env';
import { LoginPage } from '../pages/LoginPage';

export const TEST_USER_IDS: Record<string, { id: string; role: 'admin' | 'customer' | 'retailer'; email: string }> = {
  admin: {
    id: '64a000000000000000000001',
    role: 'admin',
    email: 'admin@test.com',
  },
  customer: {
    id: '64a000000000000000000002',
    role: 'customer',
    email: 'customer@test.com',
  },
  retailerA: {
    id: '64a000000000000000000003',
    role: 'retailer',
    email: 'retailerA@test.com',
  },
  retailerB: {
    id: '64a000000000000000000004',
    role: 'retailer',
    email: 'retailerB@test.com',
  },
  pending: {
    id: '64a000000000000000000005',
    role: 'customer',
    email: 'pending@test.com',
  },
};

export function createTestToken(userId: string, role: string): string {
  return jwt.sign({ id: userId, role }, ENV.JWT_SECRET, { expiresIn: '7d' });
}

export async function loginAs(
  driver: WebDriver,
  userKeyOrEmail: 'admin' | 'customer' | 'retailerA' | 'retailerB' | 'pending' | string
): Promise<void> {
  const user = TEST_USER_IDS[userKeyOrEmail] || Object.values(TEST_USER_IDS).find(u => u.email === userKeyOrEmail);
  if (!user) {
    throw new Error(`Unknown test user: ${userKeyOrEmail}`);
  }

  const currentUrl = await driver.getCurrentUrl();
  if (!currentUrl || !currentUrl.startsWith(ENV.BASE_URL)) {
    await driver.get(`${ENV.BASE_URL}/account/login`);
  }

  const result = await driver.executeAsyncScript(
    (email: string, pass: string, done: (res: any) => void) => {
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.token) {
            try {
              localStorage.setItem('auth_token', data.token);
              localStorage.setItem('user', JSON.stringify(data.user));
              localStorage.setItem('user_logged_in', 'true');
            } catch {}
          }
          done(data);
        })
        .catch((err) => done({ error: err.message }));
    },
    user.email,
    'Password123!'
  );

  if (!result || (result as any).error) {
    throw new Error(`Failed to login as ${userKeyOrEmail}: ${JSON.stringify(result)}`);
  }
}

export async function logout(driver: WebDriver): Promise<void> {
  try {
    await driver.manage().deleteCookie('shopit_session');
    await driver.executeAsyncScript((done: () => void) => {
      try {
        localStorage.clear();
        fetch('/api/auth/logout', { method: 'POST' }).finally(done);
      } catch {
        done();
      }
    });
  } catch {}
}

export async function loginViaUI(driver: WebDriver, email: string, password: string): Promise<void> {
  const loginPage = new LoginPage(driver);
  await loginPage.login(email, password);
}
