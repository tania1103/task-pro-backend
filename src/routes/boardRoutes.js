/**
 * @file boardRoutes.js
 * @description Routes for board CRUD operations
 */

const express = require('express');
const { 
  createBoard,
  getAllBoards,
  getBoardById,
  updateBoard,
  deleteBoard
} = require('../controllers/boardController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { validateBoardCreate, validateBoardUpdate } = require('../middlewares/validationMiddleware');

const router = express.Router();

// All board routes require authentication
router.use(authMiddleware);

/**
 * @route POST /api/boards
 * @desc Create a new board
 * @access Private
 */
router.post('/', validateBoardCreate, createBoard);

/**
 * @route GET /api/boards
 * @desc Get all boards for the current user
 * @access Private
 */
router.get('/', getAllBoards);

/**
 * @route GET /api/boards/:id
 * @desc Get a board by ID
 * @access Private
 */
router.get('/:id', getBoardById);

/**
 * @route PUT /api/boards/:id
 * @desc Update a board
 * @access Private
 */
router.put('/:id', validateBoardUpdate, updateBoard);

/**
 * @route DELETE /api/boards/:id
 * @desc Delete a board
 * @access Private
 */
router.delete('/:id', deleteBoard);

module.exports = router;
