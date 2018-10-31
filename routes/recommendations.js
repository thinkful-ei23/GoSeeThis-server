'use strict';

const express = require('express');
const passport = require('passport');
const Recommendation = require('../models/recommendation');
const router = express.Router();

const jwtAuth = passport.authenticate('jwt', {session: false, failWithError: true});

router.post('/', (req, res, next) => {
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

module.exports = router;