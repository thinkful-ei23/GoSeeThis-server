'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const Follow = require('../models/follow');
const User = require('../models/user');
const router = express.Router();

const jwtAuth = passport.authenticate('jwt', {
  session: false,
  failWithError: true
});

router.post('/follow', jwtAuth, (req, res, next) => {
  const { following } = req.body;
  const newFollow = {
    follower: req.user.id,
    following
  };

  return Follow.create(newFollow)
    .then(result => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('You already follow this user');
        err.status = 400;
      }
      next(err);
    });
});

router.get('/following', jwtAuth, (req, res, next) => {
  const userId = req.user.id;

  let following;

  Follow.find({follower: userId})
    .then(result => {
      if (result) {
        following = result.map(follow => follow.following);
      } else {
        next();
      }
    })
    .then(() => {
      return User.find({_id: {$in: following}});
    })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

router.get('/followers', jwtAuth, (req, res, next) => {
  const userId = req.user.id;
  let followers;

  Follow.find({following: userId})
    .then(result => {
      if (result) {
        followers = result.map(follow => follow.follower);
      } else {
        next();
      }
    })
    .then(() => {
      return User.find({_id: {$in: followers}});
    })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

router.delete('/unfollow', jwtAuth, (req, res, next) => {
  const userId = req.user.id;
  const { following } = req.body;

  Follow.findOneAndRemove({ follower: userId, following})
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;