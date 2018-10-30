'use strict';

const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  movieId: String,
  recDesc: String,
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
});

recommendationSchema.set('timestamps', true);

recommendationSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  }
});

module.exports = mongoose.model('Recommendation', recommendationSchema);