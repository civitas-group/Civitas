// Mongoose schema that represents a user account.
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    post_id:{
        type: mongoose.ObjectId,
        ref: "Post",
        required:true
    },
    group_id:{
        type: mongoose.ObjectId,
        ref: "Group",
        required:true
    },
    requester:{
        type: mongoose.ObjectId,
        ref: "Account",
        required:true
    },
    resolvers_ids: [{
        type: mongoose.ObjectId,
        ref: "Account"
    }],
    resolvers_usernames:[{
        type: String
    }],
    ratings:[{
        type: Number
    }],
    // this can only be 'pending','approved','rejected'
    verification_status:{
        type: String,
        required:true
    }
},{ collection : 'reviews' });
const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;