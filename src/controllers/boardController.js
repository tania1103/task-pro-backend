const asyncHandler = require("express-async-handler");
const Board = require("../models/Board");
const Column = require("../models/Column");
const Card = require("../models/Card");

/**
 * @desc    Get all boards for a user
 * @route   GET /api/boards
 * @access  Private
 */
const getBoards = asyncHandler(async (req, res) => {
  const boards = await Board.find({ owner: req.user._id });
  res.json(boards);
});

/**
 * @desc    Get a single board with columns and cards
 * @route   GET /api/boards/:id
 * @access  Private
 */
const getBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);

  if (!board) {
    res.status(404);
    throw new Error("Board not found");
  }

  // Check ownership
  if (board.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to access this board");
  }

  // Get columns for this board
  const columns = await Column.find({ boardId: board._id }).sort({ order: 1 });

  // Get cards for all columns in this board
  const columnIds = columns.map((column) => column._id);
  const cards = await Card.find({ columnId: { $in: columnIds } }).sort({
    order: 1,
  });

  // Organize cards by column
  const columnMap = {};
  columns.forEach((column) => {
    columnMap[column._id] = {
      ...column.toObject(),
      cards: [],
    };
  });

  cards.forEach((card) => {
    if (columnMap[card.columnId]) {
      columnMap[card.columnId].cards.push(card);
    }
  });

  res.json({
    ...board.toObject(),
    columns: Object.values(columnMap),
  });
});

/**
 * @desc    Create a new board
 * @route   POST /api/boards
 * @access  Private
 */
const createBoard = asyncHandler(async (req, res) => {
  const { title, icon, background } = req.body;

  const board = await Board.create({
    title,
    icon: icon || "📋",
    background: background || "bg-1",
    owner: req.user._id,
  });

  res.status(201).json(board);
});

/**
 * @desc    Update a board
 * @route   PUT /api/boards/:id
 * @access  Private
 */
const updateBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);

  if (!board) {
    res.status(404);
    throw new Error("Board not found");
  }

  // Check ownership
  if (board.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this board");
  }

  const { title, icon, background } = req.body;

  // Update fields if provided
  if (title !== undefined) board.title = title;
  if (icon !== undefined) board.icon = icon;
  if (background !== undefined) board.background = background;

  const updatedBoard = await board.save();

  res.json(updatedBoard);
});

/**
 * @desc    Delete a board
 * @route   DELETE /api/boards/:id
 * @access  Private
 */
const deleteBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);

  if (!board) {
    res.status(404);
    throw new Error("Board not found");
  }

  // Check ownership
  if (board.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to delete this board");
  }

  // Get columns for this board
  const columns = await Column.find({ boardId: board._id });
  const columnIds = columns.map((column) => column._id);

  // Delete all cards in these columns
  await Card.deleteMany({ columnId: { $in: columnIds } });

  // Delete all columns in this board
  await Column.deleteMany({ boardId: board._id });

  // Delete the board
  await board.deleteOne();

  res.json({ message: "Board removed" });
});

module.exports = {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
};
