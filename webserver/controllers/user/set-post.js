'use strict';

//const dot = require('dot-object'); // Cambio de formato
const Joi = require('joi');

const PostModel = require('../../models/post-model');

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
  }


  try {
    //const setDataPostMongoose = dot.dot(setDataPost);

    console.log('Contenido', content);
    const now = Date.now();
    // const createDate = now.toISOString().substring(0, 19).replace('T', ' '); // Pasamos la fecha al formato del MySql. Lo pasamos a string, Cogemos los 19 primeros caracteres y quitamos la T que divide el día de la hora.
    // console.log('esto', createDate);
    const insertData = {
      uuidOwner: claims.uuid,
      uuidAuthor: claims.uuid,
      content,
      // createdAt: createDate,
      likes: [],
    };
    console.log('Ahora lo metemos en el muro');
    const data = await PostModel.create(insertData);
    console.log('mongoose data', data);
    return res.status(204).send(data);
  } catch (err) {

    return res.status(500).send(err.message);
  }
}
module.exports = setPost;