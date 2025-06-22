const mongoose = require('mongoose');

const ColumnSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [50, 'Title cannot be more than 50 characters']
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create index for faster queries
ColumnSchema.index({ board: 1 });

// Virtual for cards
ColumnSchema.virtual('cards', {
  ref: 'Card',
  localField: '_id',
  foreignField: 'column',
  justOne: false
});

// Cascade delete cards when column is deleted
ColumnSchema.pre('remove', async function(next) {
  await this.model('Card').deleteMany({ column: this._id });
  next();
});

module.exports = mongoose.model('Column', ColumnSchema);