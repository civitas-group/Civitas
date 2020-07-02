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
    }
});

const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;