'use strict';

const UserModel = require('../../models/user-model');

async function searchUsers(req, res, next) {

  const q = req.query.q
  //const { searchText } = req.params;
  console.log('Nombre a buscar', q);
  try {

    const data = await UserModel.find({ $text: { $search: q } });
    //  const data = await UserModel.find({ $text: [{fullName:searchText}] })
    console.log('mongoose data', data);
    return res.status(204).send(data);
  } catch (err) {

    return res.status(500).send(err.message);
  }

}


module.exports = searchUsers;