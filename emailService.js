const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

// Production-ready email service supporting Gmail, SendGrid, SES, Mailgun, SMTP, Ethereal
let transporter = null;

const createTransporter = async () => {
  const service = (process.env.EMAIL_SERVICE || 'ethereal').toLowerCase();
  console.log(`[Email] Initializing ${service} service...`);

  switch (service) {
    case 'gmail': {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new Error('Gmail requires EMAIL_USER and EMAIL_PASSWORD in .env');
      }
      console.log(`[Email] ✓ Gmail configured for ${process.env.EMAIL_USER}`);
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }

    case 'sendgrid': {
      if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SendGrid requires SENDGRID_API_KEY in .env');
      }
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      console.log('[Email] ✓ SendGrid API configured');
      return 'sendgrid';
    }

    case 'ses': {
      const aws = require('aws-sdk');
      if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID) {
        throw new Error('SES requires AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY');
      }
      aws.config.update({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });
      console.log(`[Email] ✓ AWS SES configured in ${process.env.AWS_REGION}`);
      return nodemailer.createTransport({
        SES: new aws.SES({ apiVersion: '2010-12-01' }),
      });
    }

    case 'mailgun': {
      if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
        throw new Error('Mailgun requires MAILGUN_API_KEY and MAILGUN_DOMAIN');
      }
      const mg = require('nodemailer-mailgun-transport');
      console.log(`[Email] ✓ Mailgun configured for ${process.env.MAILGUN_DOMAIN}`);
      return nodemailer.createTransport(
        mg({
          auth: {
            api_key: process.env.MAILGUN_API_KEY,
            domain: process.env.MAILGUN_DOMAIN,
          },
        })
      );
    }

    case 'smtp': {
      if (!process.env.SMTP_HOST) {
        throw new Error('SMTP requires SMTP_HOST');
      }
      console.log(`[Email] ✓ SMTP configured for ${process.env.SMTP_HOST}`);
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD,
            }
          : undefined,
      });
    }

    case 'ethereal':
    default: {
      console.log('[Email] ⚠ Using Ethereal test account - emails will NOT be delivered');
      const testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }
  }
};

const getTransporter = async () => {
  if (!transporter) {
    transporter = await createTransporter();
  }
  return transporter;
};

const sendEmail = async (mailOptions) => {
  const trans = await getTransporter();

  if (!mailOptions.from) {
    const fromName = process.env.EMAIL_FROM_NAME || 'ProtexxaLearn Team';
    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@protexxalearn.com';
    mailOptions.from = `${fromName} <${fromEmail}>`;
  }

  if (trans === 'sendgrid') {
    const msg = {
      to: mailOptions.to,
      from: mailOptions.from,
      subject: mailOptions.subject,
      text: mailOptions.text,
      html: mailOptions.html,
    };
    const result = await sgMail.send(msg);
    console.log(`[Email] ✓ Sent via SendGrid to ${mailOptions.to}`);
    return { messageId: result[0].headers['x-message-id'] };
  }

  const info = await trans.sendMail(mailOptions);
  console.log(`[Email] ✓ Sent to ${mailOptions.to} (ID: ${info.messageId})`);

  const service = (process.env.EMAIL_SERVICE || 'ethereal').toLowerCase();
  if (service === 'ethereal' && process.env.SHOW_ETHEREAL_PREVIEW !== 'false') {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[Email] 📧 Preview URL: ${previewUrl}`);
    info.previewUrl = previewUrl;
  }

  return info;
};

const sendVerificationEmail = async (email, name, verificationToken) => {
  try {
    const baseUrl = process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:3001';
    const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      to: email,
      subject: 'Verify Your ProtexxaLearn Account',
      text: `
Welcome to ProtexxaLearn!

Hi ${name},

Thank you for creating an account. Please verify your email by visiting:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.

Best regards,
The ProtexxaLearn Team
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; text-align: center;">ProtexxaLearn</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Welcome! Verify Your Email</h2>
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Hi <strong>${name}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Thank you for registering with ProtexxaLearn! To complete your registration and start learning, please verify your email address by clicking the button below.
              </p>
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
                    <a href="${verificationUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; font-size: 16px; color: #ffffff; text-decoration: none; font-weight: bold;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 20px 0; padding: 12px; background-color: #f8f9fa; color: #667eea; font-size: 13px; word-break: break-all; border-radius: 4px; font-family: monospace;">
                ${verificationUrl}
              </p>
              <div style="margin: 30px 0; padding: 16px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.5;">
                  ⏱ <strong>This link expires in 24 hours.</strong><br>
                  If you didn't create an account, please ignore this email.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px; text-align: center;">
                © ${new Date().getFullYear()} ProtexxaLearn by Protexxa. All rights reserved.
              </p>
              <p style="margin: 0; color: #6c757d; font-size: 12px; text-align: center;">
                This is an automated email. Please do not reply.
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
    };

    const result = await sendEmail(mailOptions);
    return {
      success: true,
      messageId: result.messageId,
      previewUrl: result.previewUrl,
    };
  } catch (error) {
    console.error('[Email] ✗ Failed to send verification email:', error.message);
    return { success: false, error: error.message };
  }
};

const sendPasswordResetEmail = async (email, name, resetToken) => {
  try {
    const baseUrl = process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:3001';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      to: email,
      subject: 'Reset Your ProtexxaLearn Password',
      text: `
Password Reset Request

Hi ${name},

We received a request to reset your password. Visit this link to create a new password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, please ignore this email.

Best regards,
The ProtexxaLearn Team
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold; text-align: center;">ProtexxaLearn</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #333333; font-size: 24px;">Reset Your Password</h2>
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                Hi <strong>${name}</strong>,
              </p>
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 16px; line-height: 1.6;">
                We received a request to reset your ProtexxaLearn password. Click the button below to create a new password.
              </p>
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td style="border-radius: 6px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); text-align: center;">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; font-size: 16px; color: #ffffff; text-decoration: none; font-weight: bold;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link:
              </p>
              <p style="margin: 0 0 20px 0; padding: 12px; background-color: #f8f9fa; color: #667eea; font-size: 13px; word-break: break-all; border-radius: 4px; font-family: monospace;">
                ${resetUrl}
              </p>
              <div style="margin: 30px 0; padding: 16px; background-color: #f8d7da; border-left: 4px solid #dc3545; border-radius: 4px;">
                <p style="margin: 0; color: #721c24; font-size: 14px; line-height: 1.5;">
                  🔒 <strong>This link expires in 1 hour.</strong><br>
                  If you didn't request this, please ignore this email and your password will remain unchanged.
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; background-color: #f8f9fa; border-top: 1px solid #e9ecef;">
              <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px; text-align: center;">
                © ${new Date().getFullYear()} ProtexxaLearn by Protexxa. All rights reserved.
              </p>
              <p style="margin: 0; color: #6c757d; font-size: 12px; text-align: center;">
                This is an automated email. Please do not reply.
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
    };

    const result = await sendEmail(mailOptions);
    return {
      success: true,
      messageId: result.messageId,
      previewUrl: result.previewUrl,
    };
  } catch (error) {
    console.error('[Email] ✗ Failed to send password reset email:', error.message);
    return { success: false, error: error.message };
  }
};

const verifyEmailConfig = async () => {
  try {
    const service = (process.env.EMAIL_SERVICE || 'ethereal').toLowerCase();
    console.log(`[Email] Verifying ${service} configuration...`);

    const trans = await getTransporter();

    if (trans && trans !== 'sendgrid' && typeof trans.verify === 'function') {
      await trans.verify();
      console.log('[Email] ✓ SMTP connection verified successfully');
    }

    return true;
  } catch (error) {
    console.error('[Email] ✗ Configuration error:', error.message);
    console.error('[Email] Please check your .env file email settings');
    return false;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEmail,
  verifyEmailConfig,
};
