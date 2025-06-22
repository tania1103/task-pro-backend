const asyncHandler = require('express-async-handler');
const Board = require('../models/Board');
const Column = require('../models/Column');
const Card = require('../models/Card');

// Get all boards for a user
const getBoards = asyncHandler(async (req, res) => {
  const boards = await Board.find({ owner: req.user._id });
  res.json(boards);
});

// Get a single board with columns and cards
const getBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);
  
  if (!board) {
    res.status(404);
    throw new Error('Board not found');
  }
  
  if (board.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to access this board');
  }
  
  const columns = await Column.find({ board: board._id }).sort({ order: 1 });
  
  const columnIds = columns.map(column => column._id);
  const cards = await Card.find({ column: { $in: columnIds } }).sort({ order: 1 });
  
  const columnMap = {};
  columns.forEach(column => {
    columnMap[column._id] = {
      ...column.toObject(),
      cards: [],
    };
  });
  
  cards.forEach(card => {
    if (columnMap[card.column]) {
      columnMap[card.column].cards.push(card);
    }
  });
  
  res.json({
    ...board.toObject(),
    columns: Object.values(columnMap),
  });
});

// Create a new board
const createBoard = async (req, res) => {
  try {
    const { title, icon, background } = req.body;
    
    // Creează board-ul
    const board = await Board.create({
      title,
      icon: icon || '📋', // Valoare implicită
      background: background || 'bg-1',
      owner: req.user._id
    });
    
    res.status(201).json({
      status: 'success',
      data: board
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update a board
const updateBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);
  
  if (!board) {
    res.status(404);
    throw new Error('Board not found');
  }
  
  if (board.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this board');
  }
  
  const { title, icon, background } = req.body;
  
  if (title !== undefined) board.title = title;
  if (icon !== undefined) board.icon = icon;
  if (background !== undefined) board.background = background;
  
  const updatedBoard = await board.save();
  
  res.json(updatedBoard);
});

// Delete a board
const deleteBoard = asyncHandler(async (req, res) => {
  const board = await Board.findById(req.params.id);
  
  if (!board) {
    res.status(404);
    throw new Error('Board not found');
  }
  
  if (board.owner.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this board');
  }
  
  const columns = await Column.find({ board: board._id });
  const columnIds = columns.map(column => column._id);
  
  await Card.deleteMany({ column: { $in: columnIds } });
  await Column.deleteMany({ board: board._id });

  // Folosește findByIdAndDelete în loc de remove (deprecated)
  await Board.findByIdAndDelete(board._id);
  
  res.json({ message: 'Board removed' });
});

module.exports = {
  getBoards,
  getBoard,
  createBoard,
  updateBoard,
  deleteBoard,
};