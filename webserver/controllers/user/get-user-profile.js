'use strict';


const UserModel = require('../../models/user-model');


async function getUserProfile(req, res, next) {

  //return res.status(200).sed();

  const { claims } = req;

  try {
    /** No queremos que muestre el _id, ni el __v que los muestra por defecto. Con lean() la consulta se hace más rápido */
    const data = await UserModel.find({}, { _id: 0, __v: 0 }).lean();

    return res.status(200).send(data);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}

module.exports = getUserProfile;