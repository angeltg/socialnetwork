'use strict';

//const dot = require('dot-object'); // Cambio de formato
const Joi = require('joi');

const UserModel = require('../../models/user-model');
const PostModel = require('../../models/post-model');
const WallModel = require('../../models/wall-model');

async function validate(payload) {
  const schema = {
    content: Joi.string().min(1).max(500).required(),
    uuidfriend: Joi.string(),

  };
  return Joi.validate(payload, schema);
}

async function setPostFriend(req, res, next) {
  const setDataPost = { ...req.body }; //crea una copia del req
  const { claims } = req;
  const { content, uuidfriend } = setDataPost;


  try {
    await validate(setDataPost);
  } catch (e) {
    return res.status(400).send(e);
  }

  // try {
  //   const filterfriend = {
  //     uuid: claims.uuid,
  //     'friends.uuidfriend': uuidfriend,
  //   }
  //   const friends = await UserModel.findOne(filterfriend);
  //   console.log('Los amigos', friends, filterfriend);
  //   if (!friends) {
  //     return res.status(403).send('No es tu amigo, no puedes escribir aquí');
  //   }

  // } catch (e) {
  //   return res.status(500).send(e);
  // }

  try {
    //const setDataPostMongoose = dot.dot(setDataPost);

    console.log('Content', content);
    const now = new Date();
    const createDate = now.toISOString().substring(0, 19).replace('T', ' '); // Pasamos la fecha al formato del MySql. Lo pasamos a string, Cogemos los 19 primeros caracteres y quitamos la T que divide el día de la hora.

    console.log(createDate);
    const insertData = {
      uuidOwner: uuidfriend,
      uuidAuthor: claims.uuid,
      content,
      createdAt: now,
      likes: [],
    }
    const data = await PostModel.create(insertData);

    const insertWall = {

      $addToSet: {
        posts: data._id,
      },
    };
    console.log(insertWall);
    const dataWall = await WallModel.updateOne({ 'uuid': uuidfriend }, insertWall);
    console.log('mongoose data', data);

    return res.status(204).send(dataWall);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}
module.exports = setPostFriend;
