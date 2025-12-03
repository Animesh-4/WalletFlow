// backend/src/services/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const emailService = {
  createTransporter() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      const host = process.env.SMTP_HOST || 'smtp.gmail.com';
      const port = process.env.SMTP_PORT || 587;
      const user = process.env.EMAIL_USER || 'NOT_SET';
      
      console.log('========================================');
      console.log('[Email Config Check]');
      console.log(`Host being used: ${host}`);
      console.log(`Port being used: ${port}`);
      console.log(`User: ${user}`);
      console.log('========================================');
      console.warn('[Email Service] WARN: Email credentials are not set in .env. Email sending is disabled.');
      return null;
    }

    // Updated configuration to work with Brevo or any standard SMTP service
    // It defaults to Gmail if SMTP_HOST is not provided.
    return nodemailer.createTransport({
      // host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      host: process.env.SMTP_HOST || 'smtp.gmail.com', 
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  },

  async sendEmail({ to, subject, html }) {
    const transporter = this.createTransporter();
    if (!transporter) {
      throw new Error('Email service is not configured.');
    }
    try {
      console.log(`[Email Service] Connecting to ${process.env.SMTP_HOST || 'Gmail'}...`);
      console.log(`[Email Service] Sending email to: ${to}`);
      const info = await transporter.sendMail({
        from: `"WalletFlow" <${process.env.EMAIL_USER}>`, // Sender address
        to,
        subject,
        html,
      });
      console.log('[Email Service] SUCCESS: Email sent. Message ID:', info.messageId);
    } catch (error) {
      console.error('[Email Service] ERROR: Failed to send email.', error);
      throw new Error('Failed to send email.');
    }
  },

  /**
   * Generates a styled, responsive HTML email template.
   * @param {string} title - The main headline of the email.
   * @param {string} body - The main paragraph content.
   * @param {object} [button] - Optional button details.
   * @param {string} button.url - The URL for the button link.
   * @param {string} button.text - The text for the button.
   * @returns {string} The complete HTML for the email.
   */
  createStyledEmailTemplate({ title, body, button }) {
    return `
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding: 20px 0;">
              <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <tr>
                  <td align="center" style="padding: 40px 0; background-color: #065F46; color: #ffffff; border-top-left-radius: 10px; border-top-right-radius: 10px;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: bold;">WalletFlow</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 40px 30px;">
                    <h2 style="font-size: 24px; margin: 0 0 20px 0; color: #333333;">${title}</h2>
                    <p style="margin: 0 0 30px 0; font-size: 16px; line-height: 1.5; color: #555555;">${body}</p>
                    ${button ? `
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="center">
                          <a href="${button.url}" style="background-color: #10B981; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">${button.text}</a>
                        </td>
                      </tr>
                    </table>
                    ` : ''}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 30px; background-color: #f4f4f4; text-align: center; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px;">
                    <p style="margin: 0; font-size: 12px; color: #888888;">&copy; ${new Date().getFullYear()} WalletFlow. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    `;
  },

  async sendPasswordResetEmail(userEmail, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = this.createStyledEmailTemplate({
        title: 'Password Reset Request',
        body: 'You requested a password reset for your WalletFlow account. Please click the button below to set a new password. If you did not request this, please ignore this email.',
        button: {
            url: resetUrl,
            text: 'Reset Your Password'
        }
    });
    await this.sendEmail({ to: userEmail, subject: 'Your WalletFlow Password Reset', html });
  },

  async sendBudgetInvitationEmail(inviteeEmail, inviterName, budgetName, invitationToken) {
    const acceptUrl = `${process.env.FRONTEND_URL}/accept-invitation?token=${invitationToken}`;
    const html = this.createStyledEmailTemplate({
        title: "You've Been Invited!",
        body: `<strong>${inviterName}</strong> has invited you to collaborate on the budget: <strong>"${budgetName}"</strong>. Click the button below to accept the invitation and join the budget.`,
        button: {
            url: acceptUrl,
            text: 'Accept Invitation'
        }
    });
    await this.sendEmail({ to: inviteeEmail, subject: `Invitation to collaborate on "${budgetName}"`, html });
  },
};

module.exports = emailService;