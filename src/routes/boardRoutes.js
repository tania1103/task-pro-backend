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
const {
  createBoard,
  getBoards,
  getBoard,
  updateBoard,
  deleteBoard,
} = require("../controllers/boardController");
const { protect } = require("../middlewares/authMiddleware");
const {
  validate,
  validations,
} = require("../middlewares/validationMiddleware");

const router = express.Router();

// All board routes require authentication
router.use(protect);

/**
 * @route POST /api/boards
 * @desc Create a new board
 * @access Private
 */
router.post("/", validate(validations.validateBoardCreate), createBoard);

/**
 * @route GET /api/boards
 * @desc Get all boards for the current user
 * @access Private
 */
router.get("/", getBoards);

/**
 * @route GET /api/boards/:id
 * @desc Get a board by ID
 * @access Private
 */
router.get("/:id", getBoard);

/**
 * @route PUT /api/boards/:id
 * @desc Update a board
 * @access Private
 */
router.put("/:id", validate(validations.validateBoardUpdate), updateBoard);

/**
 * @route DELETE /api/boards/:id
 * @desc Delete a board
 * @access Private
 */
router.delete("/:id", deleteBoard);

module.exports = router;