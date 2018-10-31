'use strict';

const express = require('express');
const passport = require('passport');
const Recommendation = require('../models/recommendation');
const router = express.Router();

const jwtAuth = passport.authenticate('jwt', {session: false, failWithError: true});

router.post('/', jwtAuth, (req, res, next) => {
  const userId = req.user.id;

  const { movieId, recDesc} = req.body;

  const newRecommendation = {
    userId,
    movieId,
    recDesc
  };

  return Recommendation.create(newRecommendation)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
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
