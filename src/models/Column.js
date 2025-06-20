const mongoose = require('mongoose');

/**
 * Column Schema
 */
const columnSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Column title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: [true, 'Column must belong to a board'],
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Virtual field for cards
 * This will create a virtual 'cards' property that will contain
 * all cards that reference this column
 */
columnSchema.virtual('cards', {
  ref: 'Card',
  localField: '_id',
  foreignField: 'columnId',
});

/**
 * Index for efficient queries
 */
columnSchema.index({ boardId: 1, order: 1 });

const Column = mongoose.model('Column', columnSchema);

module.exports = Column;
