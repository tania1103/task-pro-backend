const mongoose = require('mongoose');

/**
 * Card Schema
 */
const cardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Card title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
    deadline: {
      type: Date,
    },
    columnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Column',
      required: [true, 'Card must belong to a column'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Card must have an owner'],
    },
    labels: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
    attachments: [
      {
        url: String,
        filename: String,
        contentType: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

/**
 * Index for efficient queries
 */
cardSchema.index({ columnId: 1, order: 1 });

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;
