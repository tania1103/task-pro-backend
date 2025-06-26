const emailService = require('../services/emailService');

exports.needHelp = async (req, res, next) => {
  try {
    const { email, comment } = req.body;
    // Încarcă și compilează template-ul needHelp.html
    const html = await emailService.loadTemplate('needHelp', { email, comment });

    await emailService.sendEmail({
      email: 'taskpro.project@gmail.com',
      subject: 'Help request from TaskPro user',
      html
    });

    res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    next(error);
  }
};
