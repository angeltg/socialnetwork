'use strict';

//const dot = require('dot-object'); // Cambio de formato
const Joi = require('joi');

const PostModel = require('../../models/post-model');
const WallModel = require('../../models/wall-model');

async function validate(payload) {
  const schema = {
    content: Joi.string().min(1).max(500).required(),

  };
  return Joi.validate(payload, schema);
}


async function setPost(req, res, next) {
  const setDataPost = { ...req.body }; //crea una copia del req
  const { claims } = req;
  const content = setDataPost.content;

  try {
    await validate(setDataPost);
  } catch (e) {
    return res.status(400).send(e);
  } 3


  try {
    //const setDataPostMongoose = dot.dot(setDataPost);

    console.log('Content', content);
    const now = new Date();
    const createDate = now.toISOString().substring(0, 19).replace('T', ' '); // Pasamos la fecha al formato del MySql. Lo pasamos a string, Cogemos los 19 primeros caracteres y quitamos la T que divide el día de la hora.

    console.log(createDate);
    const insertData = {
      uuidOwner: claims.uuid,
      uuidAuthor: claims.uuid,
      content,
      createdAt: now,
      likes: [],
    }
    const data = await PostModel.create(insertData);
    const insertWall = {
      uuid: claims.uuid,
      $addToSet: {
        posts: data._id,
      },
    };
    const dataWall = await WallModel.updateOne(insertWall);
    console.log('mongoose data', data);

    return res.status(204).send(dataWall);
  } catch (err) {
    return res.status(500).send(err.message);
  }
}
module.exports = setPost;
