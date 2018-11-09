'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const Watch = require('../models/watch');
const router = express.Router();

const jwtAuth = passport.authenticate('jwt', {
  session: false,
  failWithError: true
});

router.post('/:id', jwtAuth, (req, res, next) => {
  const id = req.params.id;
  const { movieId, title, poster_path, genres, overview } = req.body;
  console.log(req.body);
  const newWatchItem = {
    movieId,
    title,
    poster_path,
    genres,
    userId: id,
    overview
  };
  Watch.create(newWatchItem)
    .then(result => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('A recommendation for this movie already exists');
        err.status = 400;
      }
      next(err);
    });
});

router.get('/:id', (req, res, next) => {
  let userId = req.params.id;
  return Watch.find({ userId })
    .sort({ updatedAt: 'asc' })
    .then(results => {
      results ? res.json(results) : next();
    })
    .catch(err => next(err));
});

router.delete('/:id', jwtAuth, (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Watch.findOneAndRemove({ _id: id, userId })
    .then(result => {
      if (!result) {
        next();
      }
      res.status(204).end();
    })
    .catch(err => next(err));
});

module.exports = router;
