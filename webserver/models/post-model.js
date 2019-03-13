'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const postSchema = new Schema({
  uuidOwner: String,
  uuidAuthor: String,
  content: String,
  comments: [{
    uuidAuthor: String,
    comment: String,
    createdAt: Date,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  likes: [String],
  deleted_at: Date,
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;