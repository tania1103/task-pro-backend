// models/Board.js
const mongoose = require('mongoose');

const BoardSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Please add a title'], trim: true, minlength: 3, maxlength: 50 },
  icon: { type: String, default: 'project' },
  background: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

BoardSchema.virtual('columns', {
  ref: 'Column',
  localField: '_id',
  foreignField: 'board'
});

BoardSchema.pre('remove', async function(next) {
  await this.model('Column').deleteMany({ board: this._id });
  next();
});

module.exports = mongoose.model('Board', BoardSchema);
