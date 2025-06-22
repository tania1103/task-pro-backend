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
  validateCardCreate,
  validateCardUpdate,
} = require("../middlewares/validationMiddleware");

const router = express.Router();

// All card routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/cards:
 *   post:
 *     summary: Create a new card
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
 *               - columnId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               columnId:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               labels:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Card created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Column not found
 */
router.post("/", validateCardCreate, createCard);

/**
 * @swagger
 * /api/cards/column/{columnId}:
 *   get:
 *     summary: Get all cards for a specific column
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: columnId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the column
 *     responses:
 *       200:
 *         description: List of cards
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Column not found
 */
router.get("/column/:columnId", getCardsByColumnId);

/**
 * @swagger
 * /api/cards/{id}:
 *   get:
 *     summary: Get a card by ID
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID
 *     responses:
 *       200:
 *         description: Card data
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Card not found
 */
router.get("/:id", getCardById);

/**
 * @swagger
 * /api/cards/{id}:
 *   put:
 *     summary: Update a card
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
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
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               labels:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Card updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Card not found
 */
router.put("/:id", validateCardUpdate, updateCard);

/**
 * @swagger
 * /api/cards/{id}:
 *   delete:
 *     summary: Delete a card
 *     tags: [Cards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Card ID
 *     responses:
 *       204:
 *         description: Card deleted successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Card not found
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
 *             required:
 *               - columnId
 *               - cardOrders
 *             properties:
 *               columnId:
 *                 type: string
 *               cardOrders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     order:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Cards reordered successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Column not found
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
 *       - name: id
 *         in: path
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
 *             required:
 *               - destinationColumnId
 *               - order
 *             properties:
 *               destinationColumnId:
 *                 type: string
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Card moved successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Card or destination column not found
 */
router.patch("/:id/move", moveCardToColumn);

module.exports = router;
