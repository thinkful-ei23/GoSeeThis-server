'use strict';

const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
  follower: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  following: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
});

followSchema.index({follower: 1, following: 1}, {unique: true});

followSchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    delete ret._id;
  }
});

module.exports = mongoose.model('Follow', followSchema);

