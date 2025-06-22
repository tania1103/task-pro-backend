/**
 * @file boardRoutes.js
 * @description Routes for board CRUD operations
 */

const express = require("express");
const {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard,
} = require("../controllers/boardController");
const { protect } = require("../middlewares/authMiddleware");

const {
  validateBoardCreate,
  validateBoardUpdate,
} = require("../middlewares/validationMiddleware");

const router = express.Router();

// All board routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/boards:
 *   post:
 *     summary: Create a new board
 *     tags: [Boards]
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
 *             properties:
 *               title:
 *                 type: string
 *                 example: Project Roadmap
 *               icon:
 *                 type: string
 *                 example: 📌
 *               background:
 *                 type: string
 *                 example: bg-1
 *     responses:
 *       201:
 *         description: Board created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Board'
 *       400:
 *         description: Validation error
 */

router.post("/", validateBoardCreate, createBoard);

/**
 * @swagger
 * /api/boards:
 *   get:
 *     summary: Get all boards for the authenticated user
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of boards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Board'
 *       401:
 *         description: Unauthorized
 */
router.get("/", getBoards);

/**
 * @swagger
 * /api/boards/{id}:
 *   get:
 *     summary: Get a single board with its columns and cards
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Board ID
 *     responses:
 *       200:
 *         description: Board details with columns and cards
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Board not found
 */
router.get("/:id", getBoard);

/**
 * @swagger
 * /api/boards/{id}:
 *   patch:
 *     summary: Update a board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The board ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               icon:
 *                 type: string
 *               background:
 *                 type: string
 *     responses:
 *       200:
 *         description: Board updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Board not found
 */
router.patch("/:id", validateBoardUpdate, updateBoard);

/**
 * @swagger
 * /api/boards/{id}:
 *   delete:
 *     summary: Delete a board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The board ID to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Board removed
 *       403:
 *         description: Not authorized to delete this board
 *       404:
 *         description: Board not found
 */
router.delete("/:id", deleteBoard);

module.exports = router;
