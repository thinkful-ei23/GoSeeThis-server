'use strict';

const express = require('express');

const Recommendation = require('../models/recommendation');

const router = express.Router();

router.get('/', (req, res, next) => {
  Recommendation.find()
    .sort({ updatedAt: 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});