const express = require('express');
const router = express.Router();
const { needHelp } = require('../controllers/needHelpController');
const { validate, validations } = require('../middlewares/validationMiddleware');

/**
 * @swagger
 * /api/need-help:
 *   post:
 *     summary: Send a help request to the TaskPro team
 *     tags: [NeedHelp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - comment
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@test.com"
 *               comment:
 *                 type: string
 *                 example: "I need technical support!"
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Missing/invalid email or comment
 *       500:
 *         description: Error sending email
 */
router.post('/', validate(validations.validateNeedHelp), needHelp);

module.exports = router;
