'use strict';

const UserModel = require('../../models/user-model');
const mysql = require('mysql2/promise');
const sgMail = require('@sendgrid/mail'); // para enviar correos eslectrónicos

// create the connection to database para buscar el email
let connection = null;
(async () => {
  connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'socialnetwork',
    password: 'pasword',
  });
})();

//** TODO la validación de los datos que nos llega con el joi */

async function existUser(uuidFriend) {

  try {
    const exists = await UserModel.findOne({ uuid: uuidFriend }).lean();

    if (!exists) {
      return false;
    }
  } catch (e) {
    return false;
  }
  return true;
}

async function nowSendEmail(email, uuid, uuidFriend) {
  // send email
  try {
    /**
     * Send email to the user adding the friend to acept in the link
     */

    // using SendGrid's v3 Node.js Library
    // https://github.com/sendgrid/sendgrid-nodejs

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    let link = 'http://localhost:8000/api/friends/activation?code=';
    link += `${uuid}`;
    link += `&code2=${uuidFriend}`;
    const linetext = `Pincha en el siguiente enlace para aceptar a tu amigo: ${link}`;
    let htmltext = '<h1>Aceptar amigos</h1>';
    htmltext += '<p>Pincha en el siguiente enlace <a href="';
    htmltext += link;
    htmltext += '">';
    htmltext += link;
    htmltext += '</a></p>';
    const msg = {
      to: email,
      from: {
        email: 'angeltg@yopmail.com',
        name: 'Social Network',
      },
      subject: 'Socila Network | Aceptar amigo',
      text: linetext,
      html: htmltext,
    };
    sgMail.send(msg);


  } catch (e) {
    console.error('Sengrid error', e);
  }
}

async function userEmail(uuid, uuidFriend) {
  try {
    const query = `SELECT * FROM users WHERE uuid="${uuid}"`;

    const email = await connection.query(query, async function (err, rows, fiedls) {
      if (err) {
        return res.status(500).send(err.message);
      }
      if (!rows[0]) {
        return res.status(404).send("El usuario no existe");
      }
      console.log(`El usuario es ${rows[0].email} `);
      await nowSendEmail(rows[0].email, uuid, uuidFriend);
      return rows[0].email;
    });

  } catch (e) {
    console.log(e);
    return res.status(409).send(e.message);
  }
  return email;
}
async function sendEmailFriend(uuid, uuidFriend) {
  await userEmail(uuid, uuidFriend);
}

async function insertFriend(uuid, queryFriend) {
  return UserModel.updateOne({ uuid: uuid }, queryFriend);
}
function checkFriends(uuid, uuidFreind) {
  /** TODO  */
}

async function setFriends(req, res, next) {

  const uuidFriend = { ...req.body };
  /** En check-jwt-token descomprimimos el token en 2, uuid y roll */
  const { claims } = req;
  /** Hacemos un await ya que el async nos devuelve una promesa */
  const friendIsUser = await existUser(uuidFriend.uuid);
  if (friendIsUser) {

    try {
      /** Por ser la primera vez creo un campo en la collection para almacenar las peticiones de amistad */
      // const modifCollection = await UserModel.update({}, { '$set': { friendsWaitting: [] } }, false, true);

    } catch (err) {
      return res.status(409).send(err.message);
    }
    /** Si llegamos hasta aquí, es que el amigo existe en la base de datos */
    try {
      /** El token pide la amistad. Con lo cual ponemos su uuid en la lista de amigos esperando del uuidFriend */
      /** $addToSet añade al final del array si el valor no existe en el mismo */
      /** En la collection user del amigo metemos la petición en estado wait
       */
      const friendPetition = {
        /** Se puede usar $push para añadir al array */
        $addToSet: {
          friends: {
            uuidFriend: claims.uuid,
            state: 'Wait',
            stateAt: new Date(),
            rejectedAt: null,
            confirmAt: null,
          }
        }
      }
      //const data = await UserModel.update({ uuid: uuidFriend.uuid }, { $addToSet: { friendsWaitting: claims.uuid } });
      // const data = await UserModel.updateOne({ uuid: uuidFriend.uuid }, friendPetition);
      const data = await insertFriend(uuidFriend.uuid, friendPetition);
      /** En la collection user del user token metemos la petición como enviada */
      const friendReception = {
        $addToSet: {
          friends: {
            uuidFriend: uuidFriend.uuid,
            state: 'Send',
            stateAt: Date.now(),
            createdAt: Date.now(),
            rejectedAt: null,
            confirmAt: null,
          }
        }
      };
      //const data2 = await UserModel.updateOne({ uuid: claims.uuid }, friendReception);
      const data2 = await insertFriend(claims.uuid, friendReception);
      console.log(data, 'y también', data2);

      sendEmailFriend(uuidFriend.uuid, claims.uuid);
      return res.status(200).send('Solicitud de amistad enviada!');

    } catch (e) {
      return res.status(409).send(e.message);
    }
  } return res.status(201).send('Tu amigo no existe en la base de datos');
}
module.exports = setFriends;
