'use strict';

const express = require('express');
const passport = require('passport');
const User = require('../models/user');

const router = express.Router();

const jwtAuth = passport.authenticate('jwt', {
  session: false,
  failWithError: true
});
router.post('/', (req, res, next) => {
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    const err = new Error(`Missing '${missingField}' in request body`);
    err.status = 422;
    return next(err);
  }

  const stringFields = ['username', 'password', 'firstName', 'lastName'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    const err = new Error(`Field: '${nonStringField}' must be type String`);
    err.status = 422;
    return next(err);
  }

  const explicitlyTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicitlyTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    const err = new Error(
      `Field: '${nonTrimmedField}' cannot start or end with whitespace`
    );
    err.status = 422;
    return next(err);
  }

  const sizedFields = {
    username: { min: 1 },
    password: { min: 6, max: 72 }
  };

  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
      req.body[field].trim().length < sizedFields[field].min
  );

  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
      req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField) {
    const min = sizedFields[tooSmallField].min;
    const err = new Error(
      `Field: '${tooSmallField}' must be at least ${min} characters long`
    );
    err.status = 422;
    return next(err);
  }

  if (tooLargeField) {
    const max = sizedFields[tooLargeField].max;
    const err = new Error(
      `Field: '${tooLargeField}' must be at most ${max} characters long`
    );
    err.status = 422;
    return next(err);
  }

  let { username, password, firstName = '', lastName = '' } = req.body;
  firstName = firstName.trim();
  lastName = lastName.trim();

  return User.hashPassword(password)
    .then(digest => {
      const newUser = {
        username,
        password: digest,
        firstName,
        lastName
      };
      return User.create(newUser);
    })
    .then(result => {
      return res
        .status(201)
        .location(`/api/user/${result.id}`)
        .json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The username already exists');
        err.status = 400;
      }
      next(err);
    });
});

router.patch('/:id', jwtAuth, (req, res, next) => {
  const id = req.params.id;
  const { watchList } = req.body;
  User.findOneAndUpdate({ _id: id }, { $push: { watchList } }, { new: true })
    .then(result => {
      console.log(result);
      result ? res.json(result) : next();
    })
    .catch(err => next(err));
});

module.exports = router;
