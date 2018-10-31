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

  const { movieId, recDesc } = req.body;

  const newRecommendation = {
    userId,
    movieId,
    recDesc
  };

  return Recommendation.create(newRecommendation)
    .then(result => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      next(err);
    });
});

router.get('/', (req, res, next) => {
  Recommendation.find()
    .sort({ updatedAt: 'desc' })
    .then(results => {
      if (results) {
        res.json(results);
      }
      else {
        next();
      }
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

router.get('/users/:id', (req, res, next) => {
  const userId = req.params.id;

  return Recommendation.find({userId})
    .sort({ updatedAt: 'desc' })
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

  return Recommendation.find({movieId})
    .sort({ updatedAt: 'desc' })
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
