const express = require('express');
const authMiddleware = require('../middleware/auth');
var Group = require('../models/group.model');
var Account = require('../models/account.model');
const Post = require('../models/post.model');
const groupRouter = express.Router();
var jwt_decode = require('jwt-decode');
const helper = require('./helper.js')

/* Create a new group */
groupRouter.post("/create", authMiddleware, (req, res) => {
    let newGroup = {
        group_name: req.body.group_name,
        supervisor_id: req.user.user_info._id,
        is_private: true,
        is_valid: false
    };
    if (req.user.user_info.is_supervisor !== true) {
      res.status(403).send({
        success: false,
        error: "You are not an admin user!"
      });
      return;
    }
    Group.create(newGroup, function(err, result) {
        if(err){
          if (JSON.stringify(err).includes('E11000')){
            res.status(409).send({
              success: false,
              error: 'E11000, Duplcate'
            });
          } else{
            res.status(400).send({
              success: false,
              error: JSON.stringify(err)
            });
          }
        } else {
          // Update user's managed_groups_ids list
          
          let listOfGroups = [];
          var criteria = {_id: req.user.user_info._id};

          // Check if user has existing managed groups
          Account.findOne(criteria, function(groupErr, user){
            if(groupErr || !user){
              res.status(400).send({
                success:false,
                error: JSON.stringify(groupErr),
              });
              return;
            } else {

              // Get existing managed groups list and push new group to list
              listOfGroups = user.managed_groups_ids;
              listOfGroups.push(result._id)

              console.log(result._id)
              console.log(listOfGroups)
              let fieldsToUpdate = { 'managed_groups_ids': listOfGroups }

              // Update admin's managed_groups_ids list
              Account.findByIdAndUpdate(req.user.user_info._id,
                { $set: fieldsToUpdate }, 
                { useFindAndModify: false, new: true },  
                function (accountErr, accountResult) {
                  if(accountErr){
                    res.status(400).send({
                      success: false,
                      error: JSON.stringify(accountErr)
                      });
                  } else {
                    res.status(201).send({
                      success: true,
                      created_group: result
                    });
                  }
              })
            }
          });
        }
    });
    
});


// Get group info, posts in group and user's groups list
groupRouter.post("/:group_id", authMiddleware, (req, res) => {
  var decoded = jwt_decode(req.token);
  var criteria = {username: decoded.username}
  var group_criteria = {_id: req.params.group_id}

  // Find account based on username
  Account.findOne(criteria, function(accountErr, user){
    if(accountErr || !user){
      res.status(400).send({
        success:false,
        error: accountErr,
      });
      return;
    } else {

      // Add user's group IDs to response 
      let full = helper.addGroupIDS(user, decoded);
      
      // Find group based on specified group_id
      Group.findOne(group_criteria, function(groupErr, group){
        if(groupErr || !group){
          res.status(400).send({
            success:false,
            error: "Invalid group",
          });
          return;
        } else {

          // Get all posts in group
          Post.find().where('_id').in(group.post_ids).exec((err, records) => {
            if (err || !records){
              res.status(400).send({
                success:false,
                error: err
              });
              return;
            } else {
              full = Object.assign(full, {
                posts: records,
                group_name: group.group_name
              })
              res.json(full);
            }
          });
        }
      })
      
    }
  })
});

module.exports = groupRouter;
