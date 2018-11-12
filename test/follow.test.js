'use strict';

const { app } = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { TEST_DATABASE_URL, JWT_SECRET } = require('../config');

const Follow = require('../models/follow');
const User = require('../models/user');

const seedFollows = require('../db/seed/followers');
const seedUsers = require('../db/seed/users');

const expect = chai.expect;
chai.use(chaiHttp);

describe('GoSeeThis - Follows', function() {
  before(function() {
    return mongoose.connect(TEST_DATABASE_URL);
  });

  let user = {};
  let token;

  beforeEach(function() {
    this.timeout(5000);
    return Promise.all([
      User.insertMany(seedUsers),
      User.createIndexes(),
      Follow.insertMany(seedFollows),
      Follow.createIndexes()
    ])
      .then(([users]) => {
        user = users[0];
        token = jwt.sign( {user}, JWT_SECRET, { subject: user.username });
      });
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });

  describe('POST /api/follow', function() {
    it('Should create and return a new follow when provided valid data', function() {
      const newFollow = {
        follower: user.id,
        following: '000000000000000000000003'
      };

      let res;
      return chai
        .request(app)
        .post('/api/follow')
        .set('Authorization', `Bearer ${token}`)
        .send(newFollow)
        .then(_res => {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys(
            'id',
            'follower',
            'following'
          );

          return Follow.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.follower).to.equal(data.follower.toString());
          expect(res.body.following).to.equal(data.following.toString());
        });
    });

    it('Should return an error when attempting to follow an already followed user', function() {
      Follow.findOne()
        .then(data => {
          const newFollow = {
            follower: data.follower,
            following: data.following
          };

          return chai
            .request(app)
            .post('/api/follow')
            .set('Authorization', `Bearer ${token}`)
            .send(newFollow);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('This movie is already in the user`s watchlist');
        });
    });
  });
});