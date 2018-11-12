'use strict';

const { app } = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { TEST_DATABASE_URL, JWT_SECRET } = require('../config');

const Watch = require('../models/watch');
const User = require('../models/user');

const seedWatchList = require('../db/seed/watch');
const seedUsers = require('../db/seed/users');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Go See This - WatchList', function() {
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
      Watch.insertMany(seedWatchList),
      Watch.createIndexes()
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
  
  describe('POST /api/watch/:id', function() {
    it('Should create and return a new watchlist movie when provided valid data', function() {
      const userId = '000000000000000000000001';
      const newWatchMovie = {
        title: 'City of God',
        movieId: 598,
        poster_path: '/gCqnQaq8T4CfioP9uETLx9iMJF4.jpg',
        genres: [
          {
            id: 18,
            name: 'Drama'
          },
          {
            id: 80,
            name: 'Crime'
          }
        ],
        overview: 'Cidade de Deus is a shantytown that started during the 1960s and became one of Rio de Janeiro\u2019s most dangerous places in the beginning of the 1980s. To tell the story of this place, the movie describes the life of various characters, all seen by the point of view of the narrator, Buscapé. Buscapé was raised in a very violent environment. Despite the feeling that all odds were against him, he finds out that life can be seen with other eyes...',
        userId
      };

      let res;
      return chai
        .request(app)
        .post(`/api/watch/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(newWatchMovie)
        .then(_res => {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys(
            'id',
            'title',
            'movieId',
            'poster_path',
            'genres',
            'overview',
            'userId',
            'createdAt',
            'updatedAt'
          );
          return Watch.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.title).to.equal(data.title);
          expect(res.body.movieId).to.equal(data.movieId);
          expect(res.body.poster_path).to.equal(data.poster_path);
          expect(res.body.genres).to.eql(data.genres);
          expect(res.body.overview).to.equal(data.overview);
          expect(res.body.userId).to.equal(data.userId.toString());
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('Should return an error when posting a duplicate movie to user`s watchlist', function() {
      let userId;

      return Watch.findOne()
        .then(data => {
          userId = data.userId;
          const newItem = {
            movieId: data.movieId,
            title: data.title,
            userId
          };
          return chai.request(app)
            .post(`/api/watch/${userId}`)
            .send(newItem)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('This movie is already in the user`s watchlist');
        });
    });
  });

  describe('GET /api/watch/:id', function() {
    it('Should retrieve and return an watchlist of movies as an array', function() {
      const userId = '000000000000000000000001';
      const newWatchMovie = {
        title: 'City of God',
        movieId: 598,
        poster_path: '/gCqnQaq8T4CfioP9uETLx9iMJF4.jpg',
        genres: [
          {
            id: 18,
            name: 'Drama'
          },
          {
            id: 80,
            name: 'Crime'
          }
        ],
        overview: 'Cidade de Deus is a shantytown that started during the 1960s and became one of Rio de Janeiro\u2019s most dangerous places in the beginning of the 1980s. To tell the story of this place, the movie describes the life of various characters, all seen by the point of view of the narrator, Buscapé. Buscapé was raised in a very violent environment. Despite the feeling that all odds were against him, he finds out that life can be seen with other eyes...',
        userId
      };

      let id;
      let res;

      chai
        .request(app)
        .post(`/api/watch/${userId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(newWatchMovie)
        .then(_res => {
          id = _res.id;
          return chai
            .request(app)
            .get(`/api/watch/${id}`);
        })
        .then(_res => {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(1);
          expect(res.body[0]).to.be.a('object');
          expect(res.body[0]).to.have.keys(
            'id',
            'title',
            'movieId',
            'poster_path',
            'genres',
            'overview',
            'userId',
            'createdAt',
            'updatedAt'
          );
        });
    });
  });

  describe('DELETE /api/watch/:id', function() {
    it('Should delete the appropriate movie (by id) from the user`s watchlist', function() {
      let id;

      return Watch.findOne({ userId: user.id })
        .then(res => {
          id = res.id;
          return chai.request(app)
            .delete(`/api/watch/${id}`)
            .set('Authorization', `Bearer ${token}`)
            .then(res => {
              expect(res).to.have.status(204);
              return Watch.findOne({_id: id, userId: user.id });
            })
            .then(data => {
              expect(data).to.equal(null);
            });
        });
    });
  });
});