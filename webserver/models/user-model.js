'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
    uuid: {
        type: String,
        unique: true,
    },
    friends: [{
        uuidFriend: String,
        state: String,
        stateAt: Date,
        rejectedAt: Date,
        confirmAt: Date,
        createdAt: Date,

    }],
    avatarUrl: String,
    fullName: String,
    preferences: {
        isPublicProfiel: Boolean,
        linkedIn: String,
        twitter: String,
        github: String,
        description: String,
    },
});

userSchema.index(
    {
        fullName: 'text',
        'preferences.linkedIn': 'text',
        'preferences.twitter': 'text',
        'preferences.github': 'text',
    },
);
const User = mongoose.model('User', userSchema);



module.exports = User;