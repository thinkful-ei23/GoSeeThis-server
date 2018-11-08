'use strict';

const { app } = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { TEST_DATABASE_URL, JWT_SECRET } = require('../config');

const Recommendation = require('../models/recommendation');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Go See This - Recommendations', function() {
  before(function() {
    return mongoose
      .connect(TEST_DATABASE_URL)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  let user = {};
  let token;

  beforeEach(function() {
    return Promise.all([Recommendation.createIndexes()]).then(([users]) => {
      user = users[0];
      token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
    });
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });
});
