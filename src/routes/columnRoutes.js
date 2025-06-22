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
 * @route POST /api/columns
 * @desc Create a new column in a board
 * @access Private
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
 * @route GET /api/columns/:id
 * @desc Get a column by ID
 * @access Private
 */
router.get("/:id", getColumnById);

/**
 * @route PUT /api/columns/:id
 * @desc Update a column
 * @access Private
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
 * @route PATCH /api/columns/reorder
 * @desc Update the order of columns in a board
 * @access Private
 */
router.patch("/reorder", updateColumnsOrder);

module.exports = router;