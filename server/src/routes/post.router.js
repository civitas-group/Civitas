// Sample Post update handling

const express = require('express');
const postRouter = express.Router();
const Post = require('../models/post.model'); // post model
const Group = require('../models/group.model');
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
postRouter.delete("/:post_id", authMiddleware, (req, res, next) => {
  Post.findByIdAndDelete(req.params.post_id, function(err, result){
      if(err){
        res.status(400).send({
          success: false,
          error: err.message
        });
      }
    res.status(200).send({
      success: true,
      data: result,
      message: "Post deleted successfully"
    });
  });
});

module.exports = postRouter;
