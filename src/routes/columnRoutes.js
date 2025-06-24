/**
 * @file columnRoutes.js
 * @description Routes for column CRUD operations within a board
 */

const express = require("express");
const {
  createColumn,
  getColumnsByBoardId,
  getColumnById,
  updateColumn,
  deleteColumn,
  updateColumnsOrder,
} = require("../controllers/columnController");
const { protect } = require("../middlewares/authMiddleware");

const {
  validate,
  validations,
} = require("../middlewares/validationMiddleware");

const router = express.Router();

// All column routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/columns:
 *   post:
 *     summary: Creează o coloană nouă în board
 *     tags: [Columns]
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
 *               - board
 *             properties:
 *               title:
 *                 type: string
 *                 example: Nouă coloană
 *               board:
 *                 type: string
 *                 example: 66511234abcdef6789012345
 *     responses:
 *       201:
 *         description: Coloană creată
 *       400:
 *         description: Date invalide
 *       401:
 *         description: Neautorizat
 */

router.post("/", validate(validations.validateColumnCreate), createColumn);

/**
 * @swagger
 * /api/columns/board/{boardId}:
 *   get:
 *     summary: Get all columns for a specific board
 *     tags: [Columns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: boardId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ul boardului
 *     responses:
 *       200:
 *         description: List of columns
 *       404:
 *         description: Board not found
 *       403:
 *         description: Unauthorized
 */
router.get("/board/:boardId", getColumnsByBoardId);

/**
 * @swagger
 * /api/columns/{id}:
 *   get:
 *     summary: Returnează o coloană după ID
 *     tags: [Columns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID-ul coloanei
 *     responses:
 *       200:
 *         description: Coloană găsită
 *       404:
 *         description: Coloană inexistentă
 *       401:
 *         description: Neautorizat
 */

router.get("/:id", getColumnById);

/**
 * @swagger
 * /api/columns/{id}:
 *   put:
 *     summary: Actualizează o coloană după ID
 *     tags: [Columns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID-ul coloanei
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Coloană modificată
 *     responses:
 *       200:
 *         description: Coloană actualizată
 *       404:
 *         description: Coloană inexistentă
 *       401:
 *         description: Neautorizat
 */

router.put("/:id", validate(validations.validateColumnUpdate), updateColumn);

/**
 * @swagger
 * /api/columns/{id}:
 *   delete:
 *     summary: Delete a column
 *     tags: [Columns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Column deleted successfully
 *       404:
 *         description: Column not found
 *       403:
 *         description: Unauthorized
 */
router.delete("/:id", deleteColumn);

/**
 * @swagger
 * /api/columns/reorder:
 *   patch:
 *     summary: Reordonează coloanele unui board
 *     tags: [Columns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               boardId:
 *                 type: string
 *                 example: 66511234abcdef6789012345
 *               columnOrders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 66513333abcdef6789012341
 *                     order:
 *                       type: integer
 *                       example: 0
 *     responses:
 *       200:
 *         description: Coloane reordonate
 *       401:
 *         description: Neautorizat
 */

router.patch("/reorder", updateColumnsOrder);

module.exports = router;