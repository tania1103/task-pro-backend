const mongoose = require('mongoose');

/**
 * Board Schema
 */
const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Board title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    icon: {
      type: String,
      default: '📋',
    },
    background: {
      type: String,
      default: 'bg-1', // Reference to a predefined background
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Board owner is required'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

/**
 * Virtual field for columns
 * This will create a virtual 'columns' property that will contain
 * all columns that reference this board
 */
boardSchema.virtual('columns', {
  ref: 'Column',
  localField: '_id',
  foreignField: 'boardId',
});

const Board = mongoose.model('Board', boardSchema);

module.exports = Board;
