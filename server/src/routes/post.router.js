// Sample Post update handling

const express = require('express');
const postRouter = express.Router();
const Post = require('../models/post.model'); // post model
const Group = require('../models/group.model');
const Comment = require('../models/comment.model');
var Account = require('../models/account.model');
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
    likes: 0,
    created: Date.now(),
  };
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
  else { 
    fieldsToUpdate = { 
      '$inc': { 'likes': req.query.like },
      '$pull': { 'like_ids': req.query.email } 
    }
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

/* Edit Single Post */
postRouter.patch("/:post_id", authMiddleware, (req, res, next) => {
  let fieldsToUpdate = req.body;
  Post.findByIdAndUpdate(req.params.post_id,{ $set: fieldsToUpdate }, 
    { new: true },  function (err, result) {
      if(err){
          res.status(400).send({
             success: false,
            error: err.message
            });
      }
      res.status(200).send({
        success: true,
        data: result,
        message: "Post updated successfully"
        });
  });
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
