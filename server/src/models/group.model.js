// Mongoose schema that represents a group.

const mongoose = require('mongoose');
/*
const tag_name = new mongoose.Schema({
    tag_name:{
        type: String,
        required: true,
        unique: true
    }
});
*/
const post_info = new mongoose.Schema({
    _id : false,
    post_id:{
        type: mongoose.ObjectId,
        ref: "Post",
        required:true
    }
});

const groupSchema = new mongoose.Schema({
    group_name: {
        type: String,
        required: true,
        unique: true
    },
    // Street address of the property
    address:{
        type: String,
        required: true
    },
    post_ids: [{
        type: mongoose.ObjectId,
        ref: "Post"
    }],
    supervisor_id: {
        type: mongoose.ObjectId,
        ref: "Account"
    },
    cosupervisor_ids:[{
        type: mongoose.ObjectId,
        ref: "Account"
    }],
    is_private: {
        type: Boolean,
        required: true
    },
    // whether the group_creation is approved
    is_approved : {
        type: Boolean,
        required: true
    },
    user_ids:[{
        type: mongoose.ObjectId,
        ref: "Account"
    }],
    invited_user_ids:[{
        type: mongoose.ObjectId,
        ref: "Account"
    }],
    announcement_ids: [{
        type: mongoose.ObjectId,
        ref: "Announcement"
    }],
    requested_to_join_user_ids:[{
        type: mongoose.ObjectId,
        ref: "Account"
    }],
    tags:[{
        _id : false,
        key:{
            type: String,
            required: true,
            unique: true
        },
        post_ids:[post_info]
    }],
    completed_reviews:[{
        type: mongoose.ObjectId,
        ref: "Review"
    }],
    pending_reviews:[{
        type: mongoose.ObjectId,
        ref: "Review"
    }]
});

const Group = mongoose.model("Group", groupSchema);
module.exports = Group;