// Mongoose schema that represents a group.

const mongoose = require('mongoose');
const groupSchema = new mongoose.Schema({
    group_name: {
        type: String,
        required: true,
        unique: true
    },
    post_ids: [{
        type: mongoose.ObjectId,
        ref: "Post"
    }],
    supervisor_id: {
        type: mongoose.ObjectId,
        ref: "Account"
    },
    is_private: {
        type: Boolean,
        required: true
    },
    is_valid : {
        type: Boolean,
        required: true
    }
});

const Group = mongoose.model("Group", groupSchema);
module.exports = Group;