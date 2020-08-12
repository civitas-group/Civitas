// Sample Post update handling

const express = require('express');
const postRouter = express.Router();
const Post = require('../models/post.model'); // post model
const Group = require('../models/group.model');
const Comment = require('../models/comment.model');
var Account = require('../models/account.model');
const Review = require('../models/review.model');
const helper = require('./helper.js');
var jwt_decode = require('jwt-decode');
// test the authentication middleware
const authMiddleware = require('../middleware/auth');

/* Get all Posts */
postRouter.get('/', (req, res, next) => {
    Post.find({} , function(err, result){
        if(err){
            res.status(400).send({
                'success': false,
                'error': err.message
            });
        }
        res.status(200).send({
            'success': true,
            'data': result
        });
    });
});

/* Get Single Post */
postRouter.get("/:post_id", (req, res, next) => {
    Post.findById(req.params.post_id, function (err, result) {
        if(err){
             res.status(400).send({
               success: false,
               error: err.message
             });
        }
        res.status(200).send({
            success: true,
            data: result
        });
     });
});


/* Add Single Post */
postRouter.post("/", authMiddleware, (req, res, next) => {
  let newPost = {
    title: req.body.title,
    body: req.body.body,
    author: req.body.author,
    is_request: req.body.is_request,
    is_timed: req.body.is_timed,
    timed_request_info: {
      expires_on: req.body.expires_on,
      expired: false,
      time_left: -1
    },
    likes: 0,
    tags_info: req.body.tags_info,
    created: Date.now(),
  };
  if (req.body.is_request) {
    newPost = Object.assign(newPost, { request_status: 'open'  });
  }
  Post.create(newPost, function(err, result) {
    if(err){
        res.status(400).send({
          success: false,
          error: JSON.stringify(err)
        });
    }

    let listOfPosts = [];
    criteria = {_id: req.body.group_id};
    // Check if user has existing managed groups
    Group.findOne(criteria, function(groupFindErr, groupFind){
      if(groupFindErr || !groupFind){
        res.status(400).send({
          success:false,
          error: JSON.stringify(groupFindErr),
        });
        return;
      } else {
        listOfPosts = groupFind.post_ids;
        listOfPosts.push(result._id)

        let fieldsToUpdate = { 'post_ids': listOfPosts }
  
        // Update
        Group.findByIdAndUpdate(req.body.group_id,
          { $set: fieldsToUpdate }, 
          { new: true, useFindAndModify: false},  
          function (groupUpdateErr, groupUpdateResult) {
            if(groupUpdateErr){
              res.status(400).send({
                success: false,
                error: JSON.stringify(groupUpdateErr)
                });
            } else {
              res.status(201).send({
                success: true,
                data: result,
                message: "Post created successfully"
              });
            }
        })
      }
    });
  });
});


/* Like/Dislike Single Post */
postRouter.patch("/:post_id/like", authMiddleware, (req, res, next) => {
  // if like, like will be set to 1; if dislike, like will be set to -1
  // increment/decrement 
  let fieldsToUpdate;

  if (req.query.like === '1') { 
    fieldsToUpdate = { 
      '$inc': { 'likes': req.query.like },
      '$push': { 'like_ids': req.query.email } 
    }
  } 
  else if (req.query.like === '-1') { 
    fieldsToUpdate = { 
      '$inc': { 'likes': req.query.like },
      '$pull': { 'like_ids': req.query.email } 
    }
  } else {
    res.status(400).send({
      success:false,
      error: "Invalid option.",
    });
    return;
  }

  Post.findByIdAndUpdate(req.params.post_id,
    fieldsToUpdate, 
    { useFindAndModify: false },
    function (err, result) {
      if(err){
        res.status(400).send({
          success: false,
          error: err.message
          });
        return;
      }
      res.status(200).send({
        success: true,
        data: result,
        message: "Post updated successfully"
      });
  });
});

/* Resolve/Unresolve Single Post 
// Requires:
// query: ?status=string ('open', 'resolved', 'closed')
// body: 
  { post_id: id of the post
    group_id: id of the Group
    // For optional use case, resolvers_ids, resolvers_usernames and ratings may be []
    resolvers_ids: [ ids of accounts that participate to resolve the request]
    resolvers_usernames:[username of resolvers]
    ratings: [rating score for each resolver]
  }
*/
postRouter.patch("/change_status", authMiddleware, (req, res, next) => {
  // if resolve, resolve will be set to 1; if unresolve, will be set to -1
  let post_id = req.body.post_id;
  var decoded = jwt_decode(req.token);
  var criteria = {username: decoded.username}
  let authorized_to_resolve = false;
  let fieldsToUpdate;

  if (req.query.status !== 'open' && req.query.status !== 'resolved'
    && req.query.status !== 'closed'){
    res.status(400).send({
      success:false,
      error: "Invalid option.",
    });
    return;
  }

  fieldsToUpdate = { '$set': { 'request_status': req.query.status }}

  // Find account based on username
  Account.findOne(criteria, function(accountErr, user){
    if(accountErr || !user){
      res.status(400).send({
        success:false,
        error: accountErr,
      });
      return;
    // Successful so far
    } else {

      // User authorized to resolve if supervisor
      if (user.is_supervisor) authorized_to_resolve = true;

      Post.findById(post_id, function(postFindErr, postFindResult){
        if(postFindErr || !postFindResult){
          res.status(400).send({
            success: false,
            error: postFindErr
          });
          return;
        } 
        // Successful so far

        // User authorized to resolve if post owner
        if (postFindResult.author == decoded.username) authorized_to_resolve = true;
        if (!authorized_to_resolve){
          res.status(401).send({ 
            success: false,
            error: "Unauthorized to delete."
          });
          return;
        }
        // Successful so far

        Post.findByIdAndUpdate(post_id,
          fieldsToUpdate, { useFindAndModify: false },
          function (err, result) {
            if(err){
              res.status(400).send({
                success: false,
                error: err.message
                });
              return;
            }
            else if (req.body.resolvers_ids.length > 0) {
               // create a review in Review
               // update Group
               Group.findOne({_id:req.body.group_id}, function(groupFindErr, groupFind){
                if(groupFindErr || !groupFind){
                  res.status(400).send({
                    success:false,
                    error: 'The group does not exist',
                  });
                  return;
                } 
                else{
                  let newReview ={
                    post_id:req.body.post_id,
                    group_id: req.body.group_id,
                    requester_id: user._id,
                    requester_username: user.username,
                    resolvers_ids: req.body.resolvers_ids,
                    resolvers_usernames:req.body.resolvers_usernames,
                    ratings: req.body.ratings,
                    verification_status:'pending'
                  };
                  Review.create(newReview, (reviewErr, newReview) => {
                    if(reviewErr){
                      res.status(400).send({
                        success: false,
                        error: 'review creation failed'
                      });
                      return;
                    }
                    else{
                      let new_pending_reviews = groupFind.pending_reviews
                      new_pending_reviews.push(newReview._id)
                      let fieldsToUpdate = {'$set':{"pending_reviews":new_pending_reviews}};
                      Group.findByIdAndUpdate(req.body.group_id,
                        fieldsToUpdate, { useFindAndModify: false },
                        async function (groupUpdateErr, groupUpdateResult) {
                          if(groupUpdateErr || !groupUpdateResult){
                            res.status(400).send({
                              success: false,
                              error: 'Updating pending_reviews failed'
                            });
                            return;
                          }
                          else{
                            // sending notifications to group_admins
                            for (i = 0; i < req.body.resolvers_ids.length; i++){
                              await helper.pushNotificationToSupervisors(groupUpdateResult, 
                                decoded.username +' creates a review for users '
                                +req.body.resolvers_usernames.toString() + ' for a new resolved request.')
                            }
                            res.status(200).send({
                              success: true,
                              msg:"Review created successfully, waiting for group admin's approval."
                            });
                            return;
                          }
                      });
                    }
                  })
                }
               });
            }
            else {
              res.status(200).send({
                success: true,
                data: result,
                message: "Post updated successfully"
              });
          }
        });
      });
    }
  })
});

/* Delete Single Post */
// Requires:
// body : {
//    post_id
//    group_id
// }
postRouter.delete("/", authMiddleware, (req, res, next) => {
  let post_id = req.body.post_id;
  let group_id = req.body.group_id;
  var decoded = jwt_decode(req.token);
  var criteria = {username: decoded.username}
  let fieldsToUpdate = { '$pull': { 'post_ids': post_id } }
  let authorized_to_delete = false;

  // Find account based on username
  Account.findOne(criteria, function(accountErr, user){
    if(accountErr || !user){
      res.status(400).send({
        success:false,
        error: accountErr,
      });
      return;
    // Successful so far
    } else {

      // User authorized to delete if supervisor
      if (user.is_supervisor) authorized_to_delete = true;

      Post.findById(post_id, function(postFindErr, postFindResult){
        if(postFindErr || !postFindResult){
          res.status(400).send({
            success: false,
            error: postFindErr
          });
          return;
        } 
        // Successful so far

        // User authorized to delete if post owner
        if (postFindResult.author == decoded.username) authorized_to_delete = true;
        if (!authorized_to_delete){
          res.status(401).send({
            success: false,
            error: "Unauthorized to delete."
          });
          return;
        }
        // Successful so far

        // Find group by group_id to remove post_id from list of post_ids
        Group.findByIdAndUpdate(group_id, fieldsToUpdate, 
        { useFindAndModify: false },
        function (groupErr, groupResult) {
          if(groupErr || !groupResult){
            res.status(400).send({
              success: false,
              error: groupErr
            });
            return;
          }
          // Successful so far
          else {
            Post.findByIdAndDelete(post_id, 
              function(postDeleteErr, postDeleteResult){
              if(postDeleteErr || !postDeleteResult){
                res.status(400).send({
                  success: false,
                  error: postDeleteErr
                });
                return;
              }
              Comment.deleteMany({ parent_post_id: post_id }, 
                function(commentErr, commentResult) {
                if (commentErr) {
                  res.status(400).send({
                    success: false,
                    error: commentErr
                  });
                } else {
                  res.status(200).send({
                    success: true,
                    data: postDeleteResult,
                    message: "Post deleted successfully"
                  });
                }
              });
            });
          }
        });
      });
    }
  })
})


module.exports = postRouter;
