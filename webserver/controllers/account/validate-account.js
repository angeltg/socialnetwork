'use strict';

const mysql = require('mysql2/promise');
const Bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

/** 
 Colocamos las constantes por defecto que nos trae bcrypt
 const saltRounds = 10; // Es para darle más alatoriedad a la encriptación
*/
// create the connection to database
let connection = null;
(async () => {
  connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'socialnetwork',
    password: 'pasword',
  });
})();

async function checkUser(rows, password) {
  //... fetch user from a db etc.
  const match = await Bcrypt.compare(password, rows[0].password);

  if (match) {
    return true;
  }

  return false;
}

function validateUser(req, res, next) {

  /** TODO Validar los datos. Que el email sea email y la pw tenga las configuración que queremos */
  const accountData = { ...req.body };
  const email = accountData.email;
  const password = accountData.password;
  /** TODO Verificar la activación del user */

  const query = `SELECT * FROM users WHERE email="${email}"`;

  // console.log(query);
  connection.query(query, function (err, rows, fiedls) {
    if (err) {
      return res.status(500).send(e.message);
    }

    if (!rows[0]) {
      return res.status(404).send("no hay rows 0");
    }


    //comparamos las contraseñas
    try {
      const isValidPassword = checkUser(rows, password);

      if (!isValidPassword) {
        throw new Error('password does not match');
      }

      const payloadJwt = {
        uuid: rows[0].uuid,
        role: 'admin', // userData.role si viene de bbdd
      };
      const jwtTokenExpiration = parseInt(process.env.AUTH_ACCESS_TOKEN_TTL, 10);
      const token = jwt.sign(payloadJwt, process.env.AUTH_JWT_SECRET, { expiresIn: jwtTokenExpiration });
      const response = {
        accessToken: token,
        expiresIn: jwtTokenExpiration,
      };

      return res.status(200).json(response);
    } catch (e) {
      return res.status(500).send(e.message);
    }
  });
}

module.exports = validateUser;
