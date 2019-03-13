'use strict';

const UserModel = require('../../models/user-model');


async function getFriendRequests(req, res, next) {
  const { uuid } = req.claims;

  /**
   * buscamos los ids de mis amigos / posibles amigos
   */
  const filter = {
    uuid,
  };

  const projection = {
    friends: 1,
    _id: 0,
  };
  console.log('Los amigos de:', uuid, 'por', filter);
  try {
    const friendsResult = await UserModel.findOne(filter, projection); // [{ ...user1 }, { ...user2 }, ...{user n}]
    /** Solo mostramos las peticiones de amistad pendientes de confirmar */
    const friendsUuids = friendsResult.friends.map(f => { if (!(f.confirmAt != null) && !(f.rejectedAt != null)) return f.uuidFriend }); // [uuid1, uuid2, ..., uuid n]
    console.log('FriendResult', friendsResult);
    console.log('FriendsUuids', friendsUuids);
    const filterFriendsData = {
      uuid: {
        $in: friendsUuids,
      },
    };

    const projectionFriendsData = {
      uuid: 1,
      avatarUrl: 1,
      fullName: 1,
      _id: 0,
    };

    const users = await UserModel.find(filterFriendsData, projectionFriendsData).lean();

    // Creamos el muro del user

    return res.send({
      data: users,
    });
  } catch (e) {
    return res.status(500).send(e.message);
  }
}

module.exports = getFriendRequests;
