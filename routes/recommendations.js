'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const Recommendation = require('../models/recommendation');
const router = express.Router();

const jwtAuth = passport.authenticate('jwt', {
  session: false,
  failWithError: true
});

router.post('/', jwtAuth, (req, res, next) => {
  const userId = req.user.id;

  const { movieId, recDesc, title, posterUrl, genre_ids } = req.body;
  const newRecommendation = {
    userId,
    movieId,
    recDesc,
    title,
    posterUrl,
    genre_ids
  };

  return Recommendation.create(newRecommendation)
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

router.get('/', (req, res, next) => {
  Recommendation.find()
    .sort({ updatedAt: 'desc' })
    .populate('userId', 'username firstName lastName')
    .then(results => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

router.patch('/:id', jwtAuth, (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { recDesc } = req.body;
  const updateRec = {
    recDesc
  };

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Recommendation.findOneAndUpdate({ _id: id, userId }, updateRec, { new: true })
    .then(result => {
      result ? res.json(result) : next();
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

  Recommendation.findOneAndRemove({ _id: id, userId })
    .then(result => {
      if (!result) {
        next();
      }
      res.status(204).end();
    })
    .catch(err => next(err));
});

router.get('/users/:id', (req, res, next) => {
  const userId = req.params.id;

  return Recommendation.find({ userId })
    .sort({ updatedAt: 'desc' })
    .populate('userId', 'username firstName lastName')
    .then(results => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

router.get('/movies/:id', (req, res, next) => {
  const movieId = req.params.id;

  return Recommendation.find({ movieId })
    .sort({ updatedAt: 'desc' })
    .populate('userId', 'username firstName lastName')
    .then(results => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
