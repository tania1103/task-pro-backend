const Column = require('../models/Column');
const Board = require('../models/Board');
const Card = require('../models/Card');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

// Create a new column in a board
exports.createColumn = async (req, res, next) => {
  try {
    const { title, board } = req.body;
    
    const boardDoc = await Board.findById(board);
    if (!boardDoc) {
      throw new NotFoundError('Board not found');
    }
    
    if (boardDoc.owner.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to add columns to this board');
    }
    
    const highestOrderColumn = await Column.findOne({ board })
      .sort({ order: -1 })
      .limit(1);
      
    const order = highestOrderColumn ? highestOrderColumn.order + 1 : 0;
    
    const column = await Column.create({
      title,
      board,
      order,
      owner: req.user.id
    });
    
    res.status(201).json({
      status: 'success',
      data: column
    });
  } catch (error) {
    next(error);
  }
};

// Get all columns for a specific board
exports.getColumnsByBoardId = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    
    const board = await Board.findById(boardId);
    if (!board) {
      throw new NotFoundError('Board not found');
    }
    
    if (board.owner.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to view this board');
    }
    
    const columns = await Column.find({ board: boardId }).sort({ order: 1 });
    
    res.status(200).json({
      status: 'success',
      data: columns
    });
  } catch (error) {
    next(error);
  }
};

// Get a column by ID
exports.getColumnById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const column = await Column.findById(id);
    if (!column) {
      throw new NotFoundError('Column not found');
    }
    
    if (column.owner.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to view this column');
    }
    
    res.status(200).json({
      status: 'success',
      data: column
    });
  } catch (error) {
    next(error);
  }
};

// Update a column
exports.updateColumn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    
    const column = await Column.findById(id);
    if (!column) {
      throw new NotFoundError('Column not found');
    }
    
    if (column.owner.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to update this column');
    }
    
    column.title = title;
    await column.save();
    
    res.status(200).json({
      status: 'success',
      data: column
    });
  } catch (error) {
    next(error);
  }
};

// Delete a column
exports.deleteColumn = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const column = await Column.findById(id);
    if (!column) {
      throw new NotFoundError('Column not found');
    }
    
    if (column.owner.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to delete this column');
    }
    
    // Delete all cards in this column
    await Card.deleteMany({ column: id });
    
    await Column.findByIdAndDelete(id);
    
    // Update order of remaining columns
    await Column.updateMany(
      { 
        board: column.board,
        order: { $gt: column.order } 
      },
      { $inc: { order: -1 } }
    );
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Update the order of columns in a board
exports.updateColumnsOrder = async (req, res, next) => {
  try {
    const { boardId, columnOrders } = req.body;
    
    const board = await Board.findById(boardId);
    if (!board) {
      throw new NotFoundError('Board not found');
    }
    
    if (board.owner.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to update this board');
    }
    
    const updatePromises = columnOrders.map(({ id, order }) => 
      Column.findOneAndUpdate(
        { _id: id, owner: req.user.id },
        { order },
        { new: true }
      )
    );
    
    await Promise.all(updatePromises);
    
    const updatedColumns = await Column.find({ board: boardId }).sort({ order: 1 });
    
    res.status(200).json({
      status: 'success',
      data: updatedColumns
    });
  } catch (error) {
    next(error);
  }
};