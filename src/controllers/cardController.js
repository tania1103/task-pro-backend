const Card = require('../models/Card');
const Column = require('../models/Column');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

// Create a new card in a column
exports.createCard = async (req, res, next) => {
  try {
    const { title, description, column, dueDate, priority, labels } = req.body;
    
    const columnDoc = await Column.findById(column);
    if (!columnDoc) {
      throw new NotFoundError('Column not found');
    }
    
    if (columnDoc.owner.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to add cards to this column');
    }
    
    const highestOrderCard = await Card.findOne({ column })
      .sort({ order: -1 })
      .limit(1);
      
    const order = highestOrderCard ? highestOrderCard.order + 1 : 0;
    
    const card = await Card.create({
      title,
      description,
      column,
      order,
      dueDate,
      priority: priority || 'low',
      labels: labels || [],
      owner: req.user.id
    });
    
    res.status(201).json({
      status: 'success',
      data: card
    });
  } catch (error) {
    next(error);
  }
};

// Get all cards for a specific column
exports.getCardsByColumnId = async (req, res, next) => {
  try {
    const { columnId } = req.params;
    
    const column = await Column.findById(columnId);
    if (!column) {
      throw new NotFoundError('Column not found');
    }
    
    if (column.owner.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to view cards in this column');
    }
    
    const cards = await Card.find({ column: columnId }).sort({ order: 1 });
    
    res.status(200).json({
      status: 'success',
      data: cards
    });
  } catch (error) {
    next(error);
  }
};

// Get a card by ID
exports.getCardById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const card = await Card.findById(id);
    if (!card) {
      throw new NotFoundError('Card not found');
    }
    
    if (card.owner.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to view this card');
    }
    
    res.status(200).json({
      status: 'success',
      data: card
    });
  } catch (error) {
    next(error);
  }
};

// Update a card
exports.updateCard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const card = await Card.findById(id);
    if (!card) {
      throw new NotFoundError('Card not found');
    }
    
    if (card.owner.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to update this card');
    }
    
    const allowedFields = ['title', 'description', 'dueDate', 'priority', 'labels'];
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        card[field] = updateData[field];
      }
    });
    
    await card.save();
    
    res.status(200).json({
      status: 'success',
      data: card
    });
  } catch (error) {
    next(error);
  }
};

// Delete a card
exports.deleteCard = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const card = await Card.findById(id);
    if (!card) {
      throw new NotFoundError('Card not found');
    }
    
    if (card.owner.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to delete this card');
    }
    
    await Card.findByIdAndDelete(id);
    
    // Update order of remaining cards
    await Card.updateMany(
      { 
        column: card.column,
        order: { $gt: card.order } 
      },
      { $inc: { order: -1 } }
    );
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Update the order of cards in a column
exports.updateCardsOrder = async (req, res, next) => {
  try {
    const { columnId, cardOrders } = req.body;
    
    const column = await Column.findById(columnId);
    if (!column) {
      throw new NotFoundError('Column not found');
    }
    
    if (column.owner.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to reorder cards in this column');
    }
    
    const updatePromises = cardOrders.map(({ id, order }) => 
      Card.findOneAndUpdate(
        { _id: id, owner: req.user.id },
        { order },
        { new: true }
      )
    );
    
    await Promise.all(updatePromises);
    
    const updatedCards = await Card.find({ column: columnId }).sort({ order: 1 });
    
    res.status(200).json({
      status: 'success',
      data: updatedCards
    });
  } catch (error) {
    next(error);
  }
};

// Move a card to another column
exports.moveCardToColumn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { destinationColumnId, order } = req.body;
    
    const card = await Card.findById(id);
    if (!card) {
      throw new NotFoundError('Card not found');
    }
    
    if (card.owner.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to move this card');
    }
    
    const destinationColumn = await Column.findById(destinationColumnId);
    if (!destinationColumn) {
      throw new NotFoundError('Destination column not found');
    }
    
    if (destinationColumn.owner.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to add cards to this column');
    }
    
    const sourceColumnId = card.column;
    
    // Update card with new column and order
    card.column = destinationColumnId;
    card.order = order;
    await card.save();
    
    // Reorder cards in the source column
    await Card.updateMany(
      { 
        column: sourceColumnId,
        order: { $gt: card.order }
      },
      { $inc: { order: -1 } }
    );
    
    // Reorder cards in the destination column
    await Card.updateMany(
      {
        column: destinationColumnId,
        _id: { $ne: id },
        order: { $gte: order }
      },
      { $inc: { order: 1 } }
    );
    
    res.status(200).json({
      status: 'success',
      data: card
    });
  } catch (error) {
    next(error);
  }
};