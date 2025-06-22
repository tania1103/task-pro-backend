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
  validateColumnCreate,
  validateColumnUpdate,
} = require("../middlewares/validationMiddleware");

const router = express.Router();

// All column routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/columns:
 *   post:
 *     summary: Create a new column
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
 *               - boardId
 *             properties:
 *               title:
 *                 type: string
 *                 example: New Column
 *               boardId:
 *                 type: string
 *                 example: 60f1b5c5fc13ae001e000001
 *     responses:
 *       201:
 *         description: Column created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Board not found
 *       403:
 *         description: Unauthorized
 */
router.post("/", validateColumnCreate, createColumn);

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
 *     summary: Get a column by ID
 *     tags: [Columns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Column ID
 *     responses:
 *       200:
 *         description: Column found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Column'
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Column not found
 */
router.get("/:id", getColumnById);

/**
 * @swagger
 * /api/columns/{id}:
 *   patch:
 *     summary: Update a column
 *     tags: [Columns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Column ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated Column
 *     responses:
 *       200:
 *         description: Column updated successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Column not found
 */
router.patch("/:id", validateColumnUpdate, updateColumn);

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
 *     summary: Update the order of columns in a board
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
 *               - boardId
 *               - columnOrders
 *             properties:
 *               boardId:
 *                 type: string
 *                 example: 60f1b5c5fc13ae001e000001
 *               columnOrders:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     order:
 *                       type: number
 *     responses:
 *       200:
 *         description: Columns reordered successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: Unauthorized
 *       404:
 *         description: Board not found
 */
router.patch("/reorder", updateColumnsOrder);

module.exports = router;
