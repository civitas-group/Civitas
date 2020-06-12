// Mongoose schema that represents a Post.

const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    required: true
  },
   is_valid: {
       type: Boolean
   }
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;
