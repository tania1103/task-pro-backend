/**
 * @file columnRoutes.js
 * @description Routes for column CRUD operations within a board
 */

const express = require('express');
const { 
  createColumn,
  getColumnsByBoardId,
  getColumnById,
  updateColumn,
  deleteColumn,
  updateColumnsOrder
} = require('../controllers/columnController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { validateColumnCreate, validateColumnUpdate } = require('../middlewares/validationMiddleware');

const router = express.Router();

// All column routes require authentication
router.use(authMiddleware);

/**
 * @route POST /api/columns
 * @desc Create a new column in a board
 * @access Private
 */
router.post('/', validateColumnCreate, createColumn);

/**
 * @route GET /api/columns/board/:boardId
 * @desc Get all columns for a specific board
 * @access Private
 */
router.get('/board/:boardId', getColumnsByBoardId);

/**
 * @route GET /api/columns/:id
 * @desc Get a column by ID
 * @access Private
 */
router.get('/:id', getColumnById);

/**
 * @route PUT /api/columns/:id
 * @desc Update a column
 * @access Private
 */
router.put('/:id', validateColumnUpdate, updateColumn);

/**
 * @route DELETE /api/columns/:id
 * @desc Delete a column
 * @access Private
 */
router.delete('/:id', deleteColumn);

/**
 * @route PATCH /api/columns/reorder
 * @desc Update the order of columns in a board
 * @access Private
 */
router.patch('/reorder', updateColumnsOrder);

module.exports = router;
