/**
 * @file cardController.js
 * @description Controller for card operations
 */

const Card = require('../models/Card');
const Column = require('../models/Column');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

/**
 * Create a new card in a column
 */
exports.createCard = async (req, res, next) => {
  try {
    const { title, description, columnId, dueDate, priority, labels } = req.body;
    
    // Check if column exists and user has access
    const column = await Column.findById(columnId);
    if (!column) {
      throw new NotFoundError('Column not found');
    }
    
    // Check if user owns the column
    if (column.owner.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to add cards to this column');
    }
    
    // Get the highest order in current cards
    const highestOrderCard = await Card.findOne({ columnId })
      .sort({ order: -1 })
      .limit(1);
      
    const order = highestOrderCard ? highestOrderCard.order + 1 : 0;
    
    // Create the card
    const card = await Card.create({
      title,
      description,
      columnId,
      order,
      dueDate,
      priority,
      labels,
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

/**
 * Get all cards for a specific column
 */
exports.getCardsByColumnId = async (req, res, next) => {
  try {
    const { columnId } = req.params;
    
    // Check if column exists and user has access
    const column = await Column.findById(columnId);
    if (!column) {
      throw new NotFoundError('Column not found');
    }
    
    // Check if user owns the column
    if (column.owner.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to view cards in this column');
    }
    
    // Get cards sorted by order
    const cards = await Card.find({ columnId }).sort({ order: 1 });
    
    res.status(200).json({
      status: 'success',
      data: cards
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a card by ID
 */
exports.getCardById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const card = await Card.findById(id);
    if (!card) {
      throw new NotFoundError('Card not found');
    }
    
    // Check if user owns the card
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

/**
 * Update a card
 */
exports.updateCard = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const card = await Card.findById(id);
    if (!card) {
      throw new NotFoundError('Card not found');
    }
    
    // Check if user owns the card
    if (card.owner.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to update this card');
    }
    
    // Update allowed fields only
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

/**
 * Delete a card
 */
exports.deleteCard = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const card = await Card.findById(id);
    if (!card) {
      throw new NotFoundError('Card not found');
    }
    
    // Check if user owns the card
    if (card.owner.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to delete this card');
    }
    
    await Card.findByIdAndDelete(id);
    
    // Update order of remaining cards
    await Card.updateMany(
      { 
        columnId: card.columnId,
        order: { $gt: card.order } 
      },
      { $inc: { order: -1 } }
    );
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * Update the order of cards in a column
 */
exports.updateCardsOrder = async (req, res, next) => {
  try {
    const { columnId, cardOrders } = req.body;
    
    // Check if column exists and user has access
    const column = await Column.findById(columnId);
    if (!column) {
      throw new NotFoundError('Column not found');
    }
    
    // Check if user owns the column
    if (column.owner.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to reorder cards in this column');
    }
    
    // Update each card order
    const updatePromises = cardOrders.map(({ id, order }) => 
      Card.findOneAndUpdate(
        { _id: id, owner: req.user.id },
        { order },
        { new: true }
      )
    );
    
    await Promise.all(updatePromises);
    
    // Get updated cards
    const updatedCards = await Card.find({ columnId }).sort({ order: 1 });
    
    res.status(200).json({
      status: 'success',
      data: updatedCards
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Move a card to another column
 */
exports.moveCardToColumn = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { destinationColumnId, order } = req.body;
    
    // Check if card exists
    const card = await Card.findById(id);
    if (!card) {
      throw new NotFoundError('Card not found');
    }
    
    // Check if user owns the card
    if (card.owner.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to move this card');
    }
    
    // Check if destination column exists
    const destinationColumn = await Column.findById(destinationColumnId);
    if (!destinationColumn) {
      throw new NotFoundError('Destination column not found');
    }
    
    // Check if user owns the destination column
    if (destinationColumn.owner.toString() !== req.user.id) {
      throw new ForbiddenError('You do not have permission to add cards to this column');
    }
    
    const sourceColumnId = card.columnId;
    
    // Update card with new column and order
    card.columnId = destinationColumnId;
    card.order = order;
    await card.save();
    
    // Reorder cards in the source column
    await Card.updateMany(
      { 
        columnId: sourceColumnId,
        order: { $gt: card.order }
      },
      { $inc: { order: -1 } }
    );
    
    // Reorder cards in the destination column
    await Card.updateMany(
      {
        columnId: destinationColumnId,
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
