'use strict';

const express = require('express');

const checkJwtToken = require('../controllers/session/check-jwt-token');
const setPost = require('../controllers/post/set-post');
const setPostFriend = require('../controllers/post/set-post-friend-wall');

const postRouter = express.Router();

postRouter.post('/post', checkJwtToken, setPost);
postRouter.post('/post/friendwall', checkJwtToken, setPostFriend);

module.exports = postRouter; 