const { TransactionalEmailsApi, SendSmtpEmail } = require('@getbrevo/brevo');
const crypto = require('crypto');

class EmailService {
  constructor() {
    this.emailAPI = new TransactionalEmailsApi();
    this.emailAPI.authentications.apiKey.apiKey = process.env.BREVO_API_KEY;
    
    this.senderEmail = process.env.BREVO_SENDER_EMAIL;
    this.senderName = process.env.BREVO_SENDER_NAME;
    this.appDomain = process.env.APP_DOMAIN;
  }

  // Generate secure verification token
  generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Create verification email HTML template
  createVerificationEmailTemplate(verificationToken, userEmail) {
    const verificationUrl = `https://${this.appDomain}/verify-email/${verificationToken}`;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Mat Time</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #4A4A4A;
            background-color: #FAFAFA;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #FFFFFF;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            background-color: #3D95CE;
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .logo {
            max-width: 80px;
            height: auto;
            margin-bottom: 20px;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .button {
            display: inline-block;
            background-color: #3D95CE;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 20px 0;
          }
          .footer {
            background-color: #EAEAEA;
            padding: 20px 30px;
            text-align: center;
            font-size: 14px;
            color: #9B9B9B;
          }
          .verification-code {
            background-color: #EAEAEA;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 18px;
            margin: 20px 0;
            letter-spacing: 2px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Mat Time!</h1>
            <p>Verify your email to get started</p>
          </div>
          
          <div class="content">
            <h2>Almost there!</h2>
            <p>Thanks for joining Mat Time. To complete your registration and start tracking your martial arts journey, please verify your email address.</p>
            
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            
            <p style="margin-top: 30px;">
              <small>If the button doesn't work, copy and paste this link into your browser:</small><br>
              <span style="color: #3D95CE; word-break: break-all;">${verificationUrl}</span>
            </p>
            
            <p style="margin-top: 30px;">
              <strong>This verification link will expire in 24 hours.</strong>
            </p>
          </div>
          
          <div class="footer">
            <p>This email was sent to ${userEmail}</p>
            <p>If you didn't create an account with Mat Time, you can safely ignore this email.</p>
            <p>&copy; 2025 Mat Time. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send verification email
  async sendVerificationEmail(userEmail, userName, verificationToken) {
    try {
      const message = new SendSmtpEmail();
      
      message.subject = 'Verify Your Email - Mat Time';
      message.htmlContent = this.createVerificationEmailTemplate(verificationToken, userEmail);
      message.sender = { 
        name: this.senderName, 
        email: this.senderEmail 
      };
      message.to = [{ 
        email: userEmail, 
        name: userName 
      }];

      const response = await this.emailAPI.sendTransacEmail(message);
      console.log('Verification email sent successfully:', response.body);
      return { success: true, messageId: response.body.messageId };
      
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  // Send welcome email after verification (optional)
  async sendWelcomeEmail(userEmail, userName) {
    try {
      const message = new SendSmtpEmail();
      
      message.subject = 'Welcome to Mat Time - Let\'s Start Training!';
      message.htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #3D95CE; color: white; padding: 30px; text-align: center;">
            <h1>Welcome to Mat Time, ${userName}!</h1>
          </div>
          <div style="padding: 30px;">
            <p>Your email has been verified and your account is now active!</p>
            <p>You can now:</p>
            <ul>
              <li>Log your training sessions</li>
              <li>Track your progress</li>
              <li>Organize your techniques with tags</li>
              <li>View your training statistics</li>
            </ul>
            <p>Ready to start your martial arts journey with Mat Time?</p>
          </div>
        </div>
      `;
      message.sender = { 
        name: this.senderName, 
        email: this.senderEmail 
      };
      message.to = [{ 
        email: userEmail, 
        name: userName 
      }];

      await this.emailAPI.sendTransacEmail(message);
      console.log('Welcome email sent successfully');
      
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw error for welcome email failure - it's not critical
    }
  }
}

module.exports = new EmailService();