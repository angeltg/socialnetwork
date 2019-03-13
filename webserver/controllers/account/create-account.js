'use strict';

const Joi = require('joi'); // Importante esta librería vale para validar los datos de entrada
const Bcrypt = require('bcrypt'); // Importamos la librería para codificar la password
const uuidV4 = require('uuid/v4');
const mysql = require('mysql2/promise');
const sgMail = require('@sendgrid/mail'); // para enviar correos eslectrónicos
const UserModel = require('../../models/user-model');
const WallModel = require('../../models/wall-model');

// Colocamos las constantes por defecto que nos trae bcrypt
const saltRounds = 10; // Es para darle más alatoriedad a la encriptación


// Para refactorizar que es ordenar el código.
// Conectamos con la base de datos

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

// Conectamos y hacemos la prueba de conexión
// connection.query(
//   'select 1+1',
//   function (err, results, fields) {
//     console.log(results);
//     console.log(fields);
//   }
// );

async function validateSchema(payload) {
  /**
   * TODO: Fill email, password and full name rules to be (all fields are mandatory):
   *  email: Valid email
   *  password: Letters (upper and lower case) and number
   *    Minimun 3 and max 30 characters, using next regular expression: /^[a-zA-Z0-9]{3,30}$/  Esta regular expresion es la condicion de la contraseña que tenemos que pasa a join
   * fullName: String with 3 minimun characters and max 128
   */

  const schema = Joi.object().keys({
    email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
  });


  // const schema = {
  // email: rules.email,
  // password: rules.password,
  // fullName: rules.fullName,
  // };

  return Joi.validate(payload, schema);
}

async function create(req, res, next) {
  const accountData = { ...req.body }; // cogemos los datos de la cuenta

  /**
   * Validate if user data is valid to create an account
   * in other case, generate a 400 Bad Request error
   */

  try {
    await validateSchema(accountData);
  } catch (e) {
    console.log("Los datos no son correctos", e);
    return res.status(400).send(e.message);
    // Create validation error
  }
  // Hacemos un destructurin
  const {
    email,
    password,
    // fullName,
  } = accountData;

  try {



    /**
     * TODO: Insert user into MySQL
     *  hash the password using bcrypt library
     */
    // tenemos que generar el uuid con el v4
    const securePassword = await Bcrypt.hash(password, saltRounds); // 'TODO' /* USE BCRYPT TO CIPHER THE PASSWORD */;
    const uuid = uuidV4(); // creamos la variable de uuid
    const now = new Date(); // cogemos la fecha del sistema
    const createDate = now.toISOString().substring(0, 19).replace('T', ' '); // Pasamos la fecha al formato del MySql. Lo pasamos a string, Cogemos los 19 primeros caracteres y quitamos la T que divide el día de la hora.

    // string templates es6`${email}`
    console.log(`Los datos están correctos. Vamos a insertar en la base de tado:  ${email}  ${uuid}  ${securePassword}  ${createDate}`);



    /** Creamos la tabla de use en mongodb */

    // eslint-disable-next-line no-inner-declarations
    async function createUserProfile(uuid) {
      const userProfileData = {
        uuid,
        friends: [],
        avatarUrl: null,
        fullName: null,
        preferences: {
          isPublicProfiel: false,
          linkedIn: null,
          twitter: null,
          github: null,
          description: null,
        },
      };
      try {
        const userCreated = await UserModel.create(userProfileData);
        /** Creamos el muro del user */
        console.log(userCreated);
        const insertWall = {
          uuid,
          posts: [],

        };
        const dataWall = await WallModel.updateOne(insertWall);

      } catch (e) {
        console.error(e);
      }
    }

    /**
     * TODO: Insert user into mysql and get the user uuid
     */

    try {
      await connection.query('INSERT INTO users SET ?', {
        uuid, // como estos campos tienen el mismo nombre en el campo y en la variable no hace falta poner las 2 cosas.
        email,
        password: securePassword,
        created_at: createDate,

      });
      await createUserProfile(uuid);

    } catch (e) {
      console.log(e);
      return res.status(409).send(e.message);
    }




    /**
     * TODO: CREATE VERIFICATION CODE AND INSERT IT INTO MySQL
     */
    // const verificationCode = 'TODO: use uuid library to generate a uuid version 4';
    const verificationCode = uuidV4();
    // insetarmos el codígo de activiación de en la bbdd
    try {

      await connection.query('INSERT INTO users_activation SET ?', {
        user_uuid: uuid, // como estos campos tienen el mismo nombre en el campo y en la variable no hace falta poner las 2 cosas.
        verification_code: verificationCode,
        created_at: createDate,

      });


    } catch (e) {
      console.log(e);
      return res.status(409).send(e.message);
    }





    /**
     * TODO: Tell user the account was created
     */

    res.status(204).json();  // Enviamos respuesta de que el user está registrado

    // send email
    try {
      /**
       * Send email to the user adding the verificationCode in the link
       */

      // using SendGrid's v3 Node.js Library
      // https://github.com/sendgrid/sendgrid-nodejs

      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      let link = 'http://localhost:8000/api/account/activation/';
      link += verificationCode;
      const linetext = `Pincha en el siguiente enlace para activar tu cuenta de usuario: ${link}`;
      let htmltext = '<h1>Activación de la cuenta</h1>';
      htmltext += '<p>Pincha en el siguiente enlace <a href="';
      htmltext += link;
      htmltext += '">';
      htmltext += link;
      htmltext += '</a></p>';
      const msg = {
        to: email,
        from: {
          email: process.env.SEND_EMAIL,
          name: 'Social Network',
        },
        subject: 'Socila Network | Activación de usuario',
        text: linetext,
        html: htmltext,
      };
      sgMail.send(msg);


    } catch (e) {
      console.error('Sengrid error', e);
    }
  } catch (e) {
    // create error
    next(e);
  }
}

module.exports = create;
