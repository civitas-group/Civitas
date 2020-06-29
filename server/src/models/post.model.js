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
  author: {   // username of author
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  comment_ids: [{
    type: mongoose.ObjectId,
    ref: "Comment"
  }],
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
