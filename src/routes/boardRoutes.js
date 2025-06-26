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
  uploadBoardBackground,
  deleteBoard, 
} = require("../controllers/boardController");
const upload = require("../middlewares/uploadMiddleware");
const { protect } = require("../middlewares/authMiddleware");
const {
  validate,
  validations,
} = require("../middlewares/validationMiddleware");

const router = express.Router();

// All board routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/boards:
 *   post:
 *     summary: Creează un board nou
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
 *                 example: Board nou
 *               icon:
 *                 type: string
 *                 example: "📌"
 *               background:
 *                 type: string
 *                 example: "bg-1"
 *     responses:
 *       201:
 *         description: Board creat
 *       400:
 *         description: Date invalide
 *       401:
 *         description: Neautorizat
 */

router.post("/", validate(validations.validateBoardCreate), createBoard);

/**
 * @swagger
 * /api/boards:
 *   get:
 *     summary: Listă boards ale utilizatorului
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listă boards
 *       401:
 *         description: Neautorizat
 */

router.get("/", getBoards);

/**
 * @swagger
 * /api/boards/{id}:
 *   get:
 *     summary: Returnează un board după ID
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID-ul boardului
 *     responses:
 *       200:
 *         description: Board găsit
 *       404:
 *         description: Board inexistent
 *       401:
 *         description: Neautorizat
 */

router.get("/:id", getBoard);

/**
 * @swagger
 * /api/boards/{id}:
 *   put:
 *     summary: Actualizează un board după ID
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID-ul boardului
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Board actualizat
 *               icon:
 *                 type: string
 *                 example: "📊"
 *               background:
 *                 type: string
 *                 example: "bg-2"
 *     responses:
 *       200:
 *         description: Board actualizat
 *       404:
 *         description: Board inexistent
 *       401:
 *         description: Neautorizat
 */

router.put("/:id", validate(validations.validateBoardUpdate), updateBoard);

/**
 * @swagger
 * /api/boards/{id}/background:
 *   patch:
 *     summary: Upload board background image
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Board ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Board background uploaded successfully
 *       400:
 *         description: Error message
 */
router.patch('/:id/background', upload.single('image'), uploadBoardBackground);

/**
 * @swagger
 * /api/boards/{id}:
 *   delete:
 *     summary: Șterge un board după ID
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID-ul boardului
 *     responses:
 *       204:
 *         description: Board șters
 *       404:
 *         description: Board inexistent
 *       401:
 *         description: Neautorizat
 */

router.delete("/:id", deleteBoard);

module.exports = router;