'use strict';

const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  movieId: String,
  title: String,
  posterUrl: String,
  genre_ids: [{type: Number}],
  recDesc: {type: String, required: true},
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
});

recommendationSchema.index({movieId: 1, userId: 1}, {unique: true});

recommendationSchema.set('timestamps', true);

recommendationSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  }
});

module.exports = mongoose.model('Recommendation', recommendationSchema);