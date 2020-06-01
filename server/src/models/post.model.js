// Mongoose schema that represents a Post.

const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
   description: {
       type: String,
       required: true
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
