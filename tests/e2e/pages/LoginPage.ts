import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  async open(): Promise<void> {
    await super.open('/account/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.open();
    await this.type('login-email', email);
    await this.type('login-password', password);
    await this.click('login-submit');
  }

  async fillForm(email: string, password: string): Promise<void> {
    await this.type('login-email', email);
    await this.type('login-password', password);
  }

  async submit(): Promise<void> {
    await this.click('login-submit');
  }

  async getEmailError(): Promise<string> {
    return await this.text('login-email-error');
  }

  async getPasswordError(): Promise<string> {
    return await this.text('login-password-error');
  }

  async hasEmailError(): Promise<boolean> {
    return await this.isVisible('login-email-error', 3000);
  }

  async hasPasswordError(): Promise<boolean> {
    return await this.isVisible('login-password-error', 3000);
  }
}
