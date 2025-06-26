/**
 * @file emailService.js
 * @description Service for sending emails using nodemailer
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

/**
 * Create email transport based on environment
 */
const createTransport = () => {

  // Production: folosește .env: EMAIL_SERVICE (ex: 'Gmail', 'SendGrid')
  if (process.env.NODE_ENV === 'production' && process.env.EMAIL_SERVICE) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else {
    // Development: SMTP custom sau Ethereal
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
      port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT) : 587,
      secure: false, // use TLS/STARTTLS; true pentru 587
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
};

/**
 * Load an email template and compile it with Handlebars
 * @param {string} templateName - Name of the template file (without extension)
 * @param {Object} data - Data to inject into the template
 * @returns {Promise<string>} - Compiled HTML string
 */
const loadTemplate = async (templateName, data) => {
  const templatePath = path.join(__dirname, '../utils/emailTemplates', `${templateName}.html`);
  const template = await readFileAsync(templatePath, 'utf8');
  const compiledTemplate = handlebars.compile(template);
  return compiledTemplate(data);
};

/**
 * Send an email
 * @param {Object} options - Email sending options
 * @returns {Promise<Object>} - Email sending result
 */
exports.sendEmail = async (options) => {
  try {
    const transport = createTransport();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    // Add attachments if provided
    if (options.attachments) {
      mailOptions.attachments = options.attachments;
    }

    const result = await transport.sendMail(mailOptions);

    // În development (Ethereal), afișează linkul de preview
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(result));
    }

    return result;
  } catch (error) {
    console.error('ERROR FULL:', error);
    throw error;
  }
};

/**
 * Send a welcome email to a new user
 * @param {Object} user - User data
 * @returns {Promise<Object>} - Email sending result
 */
exports.sendWelcomeEmail = async (user) => {
  const html = await loadTemplate('welcome', {
    name: user.name,
    appUrl: process.env.FRONTEND_URL
  });

  return this.sendEmail({
    email: user.email,
    subject: 'Welcome to Task Pro!',
    html
  });
};

/**
 * Send a password reset email
 * @param {Object} user - User data
 * @param {string} resetToken - Password reset token
 * @returns {Promise<Object>} - Email sending result
 */
exports.sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const html = await loadTemplate('passwordReset', {
    name: user.name,
    resetUrl,
    expiryHours: 1 // Token expires in 1 hour
  });

  return this.sendEmail({
    email: user.email,
    subject: 'Password Reset Request',
    html
  });
};

/**
 * Load an email template by name and compile it with data
 * @param {string} templateName - Name of the template file (without extension)
 * @param {Object} data - Data to inject into the template
 * @returns {Promise<string>} - Compiled HTML string
 */
exports.loadTemplate = loadTemplate;
