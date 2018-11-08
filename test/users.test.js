'use strict';

const { app } = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_DATABASE_URL } = require('../config');

const User = require('../models/user');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Go See This - Users', function() {
  const username = 'exampleUser';
  const password = 'examplePass';
  const firstName = 'Example';
  const lastName = 'User';

  before(function() {
    return mongoose
      .connect(TEST_DATABASE_URL)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function() {
    return User.createIndexes();
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });

  describe('/api/users', function() {
    describe('POST', function() {
      it('Should create a new user', function() {
        const testUser = { username, password, firstName, lastName };

        let res;
        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(_res => {
            res = _res;
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'id',
              'username',
              'firstName',
              'lastName'
            );

            expect(res.body.id).to.exist;
            expect(res.body.username).to.equal(testUser.username);
            expect(res.body.firstName).to.equal(testUser.firstName);
            expect(res.body.lastName).to.equal(testUser.lastName);

            return User.findOne({ username });
          })
          .then(user => {
            expect(user).to.exist;
            expect(user.id).to.equal(res.body.id);
            expect(user.name).to.equal(testUser.name);
            return user.validatePassword(password);
          })
          .then(isValid => {
            expect(isValid).to.be.true;
          });
      });
      it('Should reject users with missing username', function() {
        const testUser = { password, firstName, lastName };
        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body.message).to.equal(
              'Missing \'username\' in request body'
            );
          });
      });
      it('Should reject users with missing password', function() {
        const testUser = { username, firstName, lastName };
        return chai
          .request(app)
          .post('/api/users')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body.message).to.equal(
              'Missing \'password\' in request body'
            );
          });
      });
      it('Should reject users with non-string username', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username: 1234,
            password,
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res).to.be.a('object');
            expect(res.body.message).to.equal(
              'Field: \'username\' must be type String'
            );
          });
      });
      it('Should reject users with non-string password', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password: 1234,
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res).to.be.a('object');
            expect(res.body.message).to.equal(
              'Field: \'password\' must be type String'
            );
          });
      });
      it('Should reject users with non-trimmed username', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username: ` ${username} `,
            password,
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res).to.be.a('object');
            expect(res.body.message).to.equal(
              'Field: \'username\' cannot start or end with whitespace'
            );
          });
      });
      it('Should reject users with non-trimmed password', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password: ` ${password} `,
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res).to.be.a('object');
            expect(res.body.message).to.equal(
              'Field: \'password\' cannot start or end with whitespace'
            );
          });
      });
      it('Should reject users with empty username', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username: '',
            password,
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body.message).to.equal(
              'Field: \'username\' must be at least 1 characters long'
            );
          });
      });
      it('Should reject users with password less than 6 characters', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password: '12345',
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body.message).to.equal(
              'Field: \'password\' must be at least 6 characters long'
            );
          });
      });
      it('Should reject users with password greater than 72 characters', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password: new Array(73).fill('a').join(''),
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body.message).to.equal(
              'Field: \'password\' must be at most 72 characters long'
            );
          });
      });
      it('Should reject users with duplicate username', function() {
        // Create an initial user
        return User.create({
          username,
          password,
          firstName,
          lastName
        })
          .then(() =>
            // Try to create a second user with the same username
            chai
              .request(app)
              .post('/api/users')
              .send({
                username,
                password,
                firstName,
                lastName
              })
          )
          .then(res => {
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res).to.be.a('object');
            expect(res.body.message).to.equal('The username already exists');
          });
      });
      it('Should trim firstName', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password,
            firstName: ` ${firstName} `,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'username',
              'firstName',
              'lastName',
              'id'
            );
            expect(res.body.username).to.equal(username);
            expect(res.body.firstName).to.equal(firstName);
            expect(res.body.lastName).to.equal(lastName);
            return User.findOne({
              username
            });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.firstName).to.equal(firstName);
            expect(user.lastName).to.equal(lastName);
          });
      });

      it('Should trim lastName', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password,
            firstName,
            lastName: ` ${lastName} `
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'username',
              'firstName',
              'lastName',
              'id'
            );
            expect(res.body.username).to.equal(username);
            expect(res.body.firstName).to.equal(firstName);
            expect(res.body.lastName).to.equal(lastName);
            return User.findOne({
              username
            });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.firstName).to.equal(firstName);
            expect(user.lastName).to.equal(lastName);
          });
      });
    });
  });
});
