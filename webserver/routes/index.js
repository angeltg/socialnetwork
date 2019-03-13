'use strict';

const accountRouter = require('./account-router');
const userRouter = require('./user-router');
const postRouter = require('./post-router');

module.exports = {
  accountRouter,
  postRouter,
  userRouter,
};