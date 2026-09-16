import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@sonotrade.io';

export class EmailService {
  /**
   * Sends a verification code to the user's email
   */
  static async sendVerificationCode(
    email: string,
    code: string
  ): Promise<void> {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Your Sonotrade Verification Code',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verification Code</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center;">
                          <h1 style="margin: 0; color: #333; font-size: 28px; font-weight: 600;">Sonotrade</h1>
                        </td>
                      </tr>

                      <!-- Content -->
                      <tr>
                        <td style="padding: 20px 40px;">
                          <p style="margin: 0 0 20px 0; color: #666; font-size: 16px; line-height: 24px;">
                            Your verification code is:
                          </p>

                          <!-- Code Box -->
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center" style="padding: 20px 0;">
                                <div style="display: inline-block; background-color: #f0f0f0; border-radius: 8px; padding: 20px 40px;">
                                  <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #333; font-family: 'Courier New', monospace;">
                                    ${code}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          </table>

                          <p style="margin: 20px 0 0 0; color: #666; font-size: 14px; line-height: 20px;">
                            This code will expire in <strong>10 minutes</strong>.
                          </p>
                        </td>
                      </tr>

                      <!-- Security Notice -->
                      <tr>
                        <td style="padding: 20px 40px 40px 40px; border-top: 1px solid #e0e0e0;">
                          <p style="margin: 0; color: #999; font-size: 12px; line-height: 18px;">
                            <strong style="color: #666;">Security Note:</strong> Never share this code with anyone. Sonotrade will never ask for your verification code.
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Footer -->
                    <table width="600" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 20px; text-align: center;">
                          <p style="margin: 0; color: #999; font-size: 12px;">
                            If you didn't request this code, you can safely ignore this email.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Sends a welcome email with wallet information
   */
  static async sendWelcomeEmail(
    email: string,
    publicKey: string
  ): Promise<void> {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: email,
        subject: 'Welcome to Sonotrade - Your Wallet is Ready',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to Sonotrade</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center;">
                          <h1 style="margin: 0 0 10px 0; color: #333; font-size: 28px; font-weight: 600;">Welcome to Sonotrade!</h1>
                          <p style="margin: 0; color: #666; font-size: 16px;">Your Solana wallet has been created</p>
                        </td>
                      </tr>

                      <!-- Content -->
                      <tr>
                        <td style="padding: 20px 40px;">
                          <p style="margin: 0 0 20px 0; color: #666; font-size: 16px; line-height: 24px;">
                            Your Solana wallet is ready for trading on prediction markets. Here's your public wallet address:
                          </p>

                          <!-- Wallet Address Box -->
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 20px; background-color: #f0f0f0; border-radius: 8px;">
                                <p style="margin: 0 0 8px 0; color: #999; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                  Your Public Key
                                </p>
                                <p style="margin: 0; color: #333; font-size: 14px; font-family: 'Courier New', monospace; word-break: break-all;">
                                  ${publicKey}
                                </p>
                              </td>
                            </tr>
                          </table>

                          <p style="margin: 20px 0 0 0; color: #666; font-size: 14px; line-height: 20px;">
                            You can view this address anytime in your account dashboard.
                          </p>
                        </td>
                      </tr>

                      <!-- Security Notice -->
                      <tr>
                        <td style="padding: 20px 40px 40px 40px; border-top: 1px solid #e0e0e0;">
                          <p style="margin: 0 0 10px 0; color: #666; font-size: 14px; font-weight: 600;">
                            Important Security Information:
                          </p>
                          <ul style="margin: 0; padding-left: 20px; color: #666; font-size: 12px; line-height: 20px;">
                            <li>Your private key is securely encrypted and stored</li>
                            <li>Never share your verification codes with anyone</li>
                            <li>Sonotrade will never ask for your private key</li>
                            <li>Keep your email account secure to protect your wallet</li>
                          </ul>
                        </td>
                      </tr>
                    </table>

                    <!-- Footer -->
                    <table width="600" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 20px; text-align: center;">
                          <p style="margin: 0; color: #999; font-size: 12px;">
                            Questions? Contact us at support@sonotrade.io
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
          </html>
        `,
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error for welcome email - it's not critical
    }
  }
}
