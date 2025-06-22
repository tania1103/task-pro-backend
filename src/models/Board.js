// filepath: d:\my projects\task-pro-backend\src\models\Board.js
const mongoose = require('mongoose');

const BoardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [50, 'Title cannot be more than 50 characters']
  },
  icon: {
    type: String,
    default: 'project'
  },
  background: {
    type: String,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for columns
BoardSchema.virtual('columns', {
  ref: 'Column',
  localField: '_id',
  foreignField: 'board',
  justOne: false
});

// Cascade delete columns when board is deleted
BoardSchema.pre('remove', async function(next) {
  await this.model('Column').deleteMany({ board: this._id });
  next();
});

module.exports = mongoose.model('Board', BoardSchema);