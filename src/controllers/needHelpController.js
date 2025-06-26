const emailService = require('../services/emailService');

exports.needHelp = async (req, res, next) => {
  try {
    const { email, comment } = req.body;

    // 1. Trimite email către adresa de suport/admin
    const html = await emailService.loadTemplate('needHelp', { email, comment });
    await emailService.sendEmail({
      email: process.env.EMAIL_SUPPORT_ADDRESS, // din .env
      subject: 'Help request from TaskPro user',
      html
    });

    // 2. Trimite email de confirmare către utilizator
    const confirmHtml = await emailService.loadTemplate('confirmHelp', { comment });
    await emailService.sendEmail({
      email, // direct către utilizator
      subject: 'We received your help request – TaskPro',
      html: confirmHtml
    });

    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    next(error);
  }
};
