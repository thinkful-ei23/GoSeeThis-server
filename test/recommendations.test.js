'use strict';

const { app } = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { TEST_DATABASE_URL, JWT_SECRET } = require('../config');

const Recommendation = require('../models/recommendation');
const User = require('../models/user');

const seedRecommendations = require('../db/seed/recommendations');
const seedUsers = require('../db/seed/users');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Go See This - Recommendations', function() {
  before(function() {
    return mongoose.connect(TEST_DATABASE_URL);
    // .then(() => mongoose.connection.db.dropDatabase());
  });

  let user = {};
  let token;

  beforeEach(function() {
    this.timeout(5000);
    return Promise.all([
      User.insertMany(seedUsers),
      User.createIndexes(),
      Recommendation.insertMany(seedRecommendations),
      Recommendation.createIndexes()
    ]).then(([users]) => {
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

  describe('POST /api/recommendation', function() {
    it('should create and return a new recommendation when provided valid data', function() {
      const newRec = {
        title: 'Bob the Builder',
        userId: '000000000000000000000001',
        movieId: '3729',
        recDesc: 'Dude it\'s Bob!',
        posterUrl: '/gpxjoE0yvRwIhFEJgNArtKtaN7S.jpg',
        genre_ids: [12, 28]
      };

      let res;
      return chai
        .request(app)
        .post('/api/recommendations')
        .set('Authorization', `Bearer ${token}`)
        .send(newRec)
        .then(_res => {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys(
            'title',
            'id',
            'userId',
            'createdAt',
            'updatedAt',
            'movieId',
            'recDesc',
            'posterUrl',
            'genre_ids'
          );
          return Recommendation.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
          expect(res.body.movieId).to.equal(data.movieId);
          expect(res.body.recDesc).to.equal(data.recDesc);
          expect(res.body.posterUrl).to.equal(data.posterUrl);
          expect(res.body.genre_ids).to.eql(data.genre_ids);
          expect(res.body.userId).to.equal(data.userId.toString());
        });
    });
  });
  describe('GET /api/recommendations', function() {
    it('should return the correct number of recommendations', function() {
      return Promise.all([
        Recommendation.find(),
        chai
          .request(app)
          .get('/api/recommendations')
          .set('Authorization', `Bearer ${token}`)
      ]).then(([data, res]) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
      });
    });

    it('should return a list with the correct fields', function() {
      return Promise.all([
        Recommendation.find({ userId: user.id }).sort('username'),
        chai
          .request(app)
          .get('/api/recommendations')
          .set('Authorization', `Bearer ${token}`)
      ]).then(([data, res]) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        res.body.forEach(function(item, i) {
          expect(item).to.be.a('object');
          expect(item).to.include.all.keys(
            'title',
            'id',
            'userId',
            'createdAt',
            'updatedAt',
            'movieId',
            'recDesc',
            'posterUrl',
            'genre_ids'
          );
          expect(item.id).to.equal(data[i].id);
          expect(item.title).to.equal(data[i].title);
          expect(new Date(item.createdAt)).to.eql(data[i].createdAt);
          expect(new Date(item.updatedAt)).to.eql(data[i].updatedAt);
          expect(item.movieId).to.equal(data[i].movieId);
          expect(item.recDesc).to.equal(data[i].recDesc);
          expect(item.posterUrl).to.equal(data[i].posterUrl);
          expect(item.genre_ids).to.eql(data[i].genre_ids);
          expect(item.userId.id).to.equal(data[i].userId.toString());
        });
      });
    });
  });

  describe('PATCH /api/recommendations', function() {
    it.only('should find and update a recommendation when given valid data', function() {
      const updateRec = { recDesc: 'Test Update' };

      let rec;
      return Recommendation.findOne()
        .then(_rec => {
          rec = _rec;
          return chai
            .request(app)
            .patch(`/api/recommendations/${rec.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateRec);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys(
            'title',
            'id',
            'userId',
            'createdAt',
            'updatedAt',
            'movieId',
            'recDesc',
            'posterUrl',
            'genre_ids'
          );
          expect(res.body.id).to.equal(rec.id);
        });
    });
  });
});
