import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
    this.from = process.env.RESEND_FROM_EMAIL ?? 'noreply@fpmi.bg';
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const resetUrl = `${
      process.env.FRONTEND_URL ?? 'http://localhost:5173'
    }/reset-password?token=${token}`;

    if (!this.resend) {
      console.log(`[EmailService] Dev mode — reset email triggered for ${to}`);
      return;
    }

    await this.resend.emails.send({
      from: this.from,
      to,
      subject: 'FPMI Hub — Reset your password',
      html: `<p>You requested a password reset.</p><p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 15 minutes.</p><p>If you didn't request this, ignore this email.</p>`,
    });
  }
}
