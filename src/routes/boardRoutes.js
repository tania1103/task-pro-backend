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

// 🔐 Toate rutele necesită autentificare
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
router.post(
  "/",
  upload.none(), // Acceptă form-data (fără fișier)
  validate(validations.validateBoardCreate),
  createBoard
);

/**
 * @swagger
 * /api/boards:
 *   get:
 *     summary: Returnează lista de boards pentru utilizator
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
 *         required: true
 *         schema:
 *           type: string
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
 *         required: true
 *         schema:
 *           type: string
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
 *     summary: Încarcă imagine personalizată ca background pentru board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID-ul boardului
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
 *         description: Imagine încărcată cu succes
 *       400:
 *         description: Eroare validare
 *       401:
 *         description: Neautorizat
 *       404:
 *         description: Board inexistent
 */
// In boardRoutes.js
router.patch(
  "/:id/background",
  upload.single("image"),
  boardController.uploadBoardBackground // ⛔ NU uploadCustomBackground!
);

/**
 * @swagger
 * /api/boards/{id}:
 *   delete:
 *     summary: Șterge un board
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
