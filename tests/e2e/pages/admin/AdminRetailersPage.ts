import { BasePage } from '../BasePage';

export class AdminRetailersPage extends BasePage {
  async open(): Promise<void> {
    await super.open('/admin/retailers');
  }

  async hasApplications(): Promise<boolean> {
    return await this.isVisible('seller-application-card');
  }

  async approveFirstApplication(): Promise<void> {
    await this.click('approve-seller-application');
  }

  async rejectFirstApplication(reason: string): Promise<void> {
    await this.type('seller-rejection-reason', reason);
    await this.click('reject-seller-application');
  }

  async getNotice(): Promise<string> {
    return await this.text('seller-review-notice');
  }
}
