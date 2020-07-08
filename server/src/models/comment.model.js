// Mongoose schema that represents a Comment.

const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
    author: {  // username of user who created the comment
        type: String,
        required: true
    },
    is_reply: {
        type: Boolean,
        required: true
    },
    reply_to_id: {
        type: mongoose.ObjectId,
        ref: "Comment"
    },
    text: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        required: true
    },
    post_owner: {
        type: String,
        required: true
    },
    parent_post_id: {
        type: mongoose.ObjectId,
        ref: "Post"
    },
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;