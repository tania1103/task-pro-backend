/**
 * @file cardRoutes.js
 * @description Routes for card CRUD operations within a column
 */

const express = require("express");
const {
  createCard,
  getCardsByColumnId,
  getCardById,
  updateCard,
  deleteCard,
  updateCardsOrder,
  moveCardToColumn,
} = require("../controllers/cardController");
const { protect } = require("../middlewares/authMiddleware");
const {
  validate,
  validations,
} = require("../middlewares/validationMiddleware");

const router = express.Router();

// All card routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/cards:
 *   post:
 *     summary: Creează un card nou
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - column
 *             properties:
 *               title:
 *                 type: string
 *                 example: Nou card
 *               column:
 *                 type: string
 *                 example: 6652abcdef34567890123456
 *               description:
 *                 type: string
 *                 example: "Card de test"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: medium
 *               deadline:
 *                 type: string
 *                 format: date
 *                 example: "2025-07-01"
 *     responses:
 *       201:
 *         description: Card creat
 *       400:
 *         description: Date invalide
 *       401:
 *         description: Neautorizat
 */

router.post("/", validate(validations.validateCardCreate), createCard);

/**
 * @swagger
 * /api/cards/column/{columnId}:
 *   get:
 *     summary: Returnează toate cardurile pentru o coloană
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: columnId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID-ul coloanei
 *     responses:
 *       200:
 *         description: Listă carduri
 *       404:
 *         description: Coloană inexistentă
 *       401:
 *         description: Neautorizat
 */

router.get("/column/:columnId", getCardsByColumnId);

/**
 * @swagger
 * /api/cards/{id}:
 *   get:
 *     summary: Obține un card după ID
 *     description: Returnează detaliile unui card pe baza ID-ului specificat. Este necesară autentificarea.
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID-ul cardului
 *     responses:
 *       200:
 *         description: Cardul a fost găsit cu succes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Card'
 *       401:
 *         description: Neautorizat
 *       404:
 *         description: Cardul nu a fost găsit
 */
router.get("/:id", getCardById);


/**
 * @swagger
 * /api/cards/{id}:
 *   put:
 *     summary: Update a card
 *     description: Update title, description, priority, deadline, etc. for an existing card.
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Update docs
 *               description:
 *                 type: string
 *                 example: Document API for frontend
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: medium
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-07-01T00:00:00.000Z"
 *     responses:
 *       200:
 *         description: Card updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Card not found
 */

router.put("/:id", validate(validations.validateCardUpdate), updateCard);

/**
 * @swagger
 * /api/cards/{id}:
 *   delete:
 *     summary: Delete a card
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID
 *     responses:
 *       204:
 *         description: Card deleted successfully
 *       404:
 *         description: Card not found
 *       403:
 *         description: Unauthorized
 */

router.delete("/:id", deleteCard);

/**
 * @swagger
 * /api/cards/reorder:
 *   patch:
 *     summary: Update the order of cards in a column
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               columnId:
 *                 type: string
 *                 example: 60f1b5c5fc13ae001e000001
 *               cardOrders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 60f6e8d8b54764421c7b9a90
 *                     order:
 *                       type: number
 *                       example: 0
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Card'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Column or card not found
 */

router.patch("/reorder", updateCardsOrder);

/**
 * @swagger
 * /api/cards/{id}/move:
 *   patch:
 *     summary: Move a card to another column
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID to move
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newColumnId:
 *                 type: string
 *                 example: 60f1b5c5fc13ae001e000001
 *               newPosition:
 *                 type: number
 *                 example: 1
 *     responses:
 *       200:
 *         description: Card moved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Card'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Card or column not found
 */
router.patch("/:id/move", validate(validations.validateCardMove), moveCardToColumn);

module.exports = router;