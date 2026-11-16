import { BasePage } from './BasePage';

export class RegisterPage extends BasePage {
  async open(): Promise<void> {
    await super.open('/account/register');
  }

  async register(
    name: string,
    email: string,
    password: string,
    confirmPassword = password,
    acceptTerms = true
  ): Promise<void> {
    await this.open();
    await this.type('register-name', name);
    await this.type('register-email', email);
    await this.type('register-password', password);
    await this.type('register-confirm-password', confirmPassword);
    if (acceptTerms) {
      await this.click('register-terms');
    }
    await this.click('register-submit');
  }

  async getNameError(): Promise<string> {
    return await this.text('register-name-error');
  }

  async getEmailError(): Promise<string> {
    return await this.text('register-email-error');
  }

  async getPasswordError(): Promise<string> {
    return await this.text('register-password-error');
  }

  async getConfirmPasswordError(): Promise<string> {
    return await this.text('register-confirm-password-error');
  }

  async getTermsError(): Promise<string> {
    return await this.text('register-terms-error');
  }
}
