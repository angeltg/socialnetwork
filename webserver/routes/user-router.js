'use strict';

const express = require('express');
const multer = require('multer'); // para subir archivos al servidor

const updateUserProfile = require('../controllers/user/update-user-profile');
const getUserProfile = require('../controllers/user/get-user-profile');
const setFriends = require('../controllers/user/set-friends');
const uploadAvatar = require('../controllers/user/upload-avatar');
const checkJwtToken = require('../controllers/session/check-jwt-token');
const searchUser = require('../controllers/user/search-users');
const addFriends = require('../controllers/user/add-firend');
const listFriendsPetitions = require('../controllers/user/get-friend-requests');
const listFriends = require('../controllers/user/get-friends');

const upload = multer(); // para subir archivos al servidor

const userRouter = express.Router();

userRouter.put('/user', checkJwtToken, updateUserProfile);
userRouter.get('/user', checkJwtToken, getUserProfile);
userRouter.post('/user/avatar', checkJwtToken, upload.single('avatar'), uploadAvatar);
/** El parámetro se pasa con comillas en la ruta */
//userRouter.get('/user/search:searchText', checkJwtToken, searchUser);
/**Este lo mandamos en la ruta así ?q=Angel */
userRouter.get('/user/search', checkJwtToken, searchUser);
//Desde front es una creación de peticion de amistad por eso lo hacemos con post en vez de put
userRouter.post('/friends', checkJwtToken, setFriends);
userRouter.put('/friends/activation', checkJwtToken, addFriends);
userRouter.get('/friends/petitions', checkJwtToken, listFriendsPetitions);
userRouter.get('/friends/list', checkJwtToken, listFriends);

module.exports = userRouter;


