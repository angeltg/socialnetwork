'use strict';

const UserModel = require('../../models/user-model');

async function updateFriends(uuid, uuidFriend) {



}

async function addFriends(req, res, next) {
  const uuid = req.query.code;
  const uuid2 = req.query.code2;

  const friendAdd = {
    $set: { // Modifica el valor que hay en el arry
      'friends.$.state': 'OK',
      'friends.$.stateAt': Date.now(),
      'friends.$.confirmAt': Date.now(),
    },
  };
  const filter = {
    uuid,
    'friends.uuidFriend': uuid2,
  };
  try {


    const data = await UserModel.findOneAndUpdate(filter, friendAdd, { rawResult: true }); // Envía el objeto sin que pase por mogoose tal y como lo envía mongo 
  } catch (e) {

  }
  //console.log('ok', uuid, uuid2);
  res.status(200).send('ok');
}

module.exports = addFriends;