const express = require('express');
const authMiddleware = require('../middleware/auth');
var Group = require('../models/group.model');
var Account = require('../models/account.model');
const Post = require('../models/post.model');
const groupRouter = express.Router();
var jwt_decode = require('jwt-decode');

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
          res.status(400).send({
            success: false,
            error: err.message
          });
        } else {
          // Update user's managed_groups_ids list
          
          let listOfGroups = [];
          var criteria = {_id: req.user.user_info._id};

          // Check if user has existing managed groups
          Account.findOne(criteria, function(groupErr, user){
            if(groupErr || !user){
              res.status(400).send({
                success:false,
                error: groupErr.message,
              });
              return;
            } else {
              listOfGroups = user.managed_groups_ids;
              listOfGroups.push(result._id)

              console.log(result._id)
              console.log(listOfGroups)
              let fieldsToUpdate = { 'managed_groups_ids': listOfGroups }

              // Update
              Account.findByIdAndUpdate(req.user.user_info._id,
                { $set: fieldsToUpdate }, 
                { useFindAndModify: false, new: true },  
                function (accountErr, accountResult) {
                  if(accountErr){
                    res.status(400).send({
                      success: false,
                      error: accountErr.message
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

groupRouter.post("/:group_id", authMiddleware, (req, res) => {
  var decoded = jwt_decode(req.token);
  var criteria = {username: decoded.username}
  var group_criteria = {_id: req.params.group_id}

  Account.findOne(criteria, function(accountErr, user){
    if(accountErr || !user){
      res.status(400).send({
        success:false,
        error: accountErr,
      });
      return;
    } else {
      let group_ids = [];
      let managed_groups_ids = [];
      if ('group_ids' in user){ group_ids = user.group_ids; }
      if ('managed_groups_ids' in user){
        managed_groups_ids = user.managed_groups_ids; 
      }
      full = Object.assign(decoded, {
        group_ids: group_ids,
        managed_groups_ids: managed_groups_ids
      })
      
      Group.findOne(group_criteria, function(groupErr, group){
        if(groupErr || !group){
          res.status(400).send({
            success:false,
            error: groupErr.message,
          });
          return;
        } else {


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
