'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const wallSchema = new Schema({
  uuid: {
    type: String,
    unique: true,
  },
  posts: [{ type: Schema.ObjectId }],

});

const wall = mongoose.model('Wall', wallSchema);

module.exports = wall;