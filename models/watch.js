'use strict';

const mongoose = require('mongoose');

const watchSchema = new mongoose.Schema({
  movieId: { type: Number, required: true },
  title: { type: String, required: true },
  poster_path: { type: String },
  genres: { type: Array },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

watchSchema.index({ movieId: 1, userId: 1 }, { unique: true });

watchSchema.set('timestamps', true);

watchSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  }
});

module.exports = mongoose.model('Watch', watchSchema);
