const express = require('express');
const authMiddleware = require('../middleware/auth');
var Group = require('../models/group.model');
var Account = require('../models/account.model');
const Post = require('../models/post.model');
const groupRouter = express.Router();
var jwt_decode = require('jwt-decode');
const helper = require('./helper.js')
const mongoose = require('mongoose');

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
      Group.findOne(group_criteria, function(err, group){
        if(err || !group){
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


////////////////////////////////////////////////////////////////////////////////
// Below is all for group invites

// Verify user_ids to invite sent in body of /group/invite
function verifyIds(req, res, next){
  // verify whether the user_id passed in are valid
  if(!req.body.user_ids){
    return res.status(400).json({
        success:false,
        error:"Please indicate the user_ids you want to invite to the group."
    });
  }
  //let user_list = Object.values(req.body.user_ids);
  let user_list = [];
  //let invalid_ids = [];
  let hasError = false;
  //let num = 0;
  //return res.status(200).json({userlist: user_list});
  req.body.user_ids.forEach(function(user_id) {
    user_list.push(mongoose.Types.ObjectId(user_id));
  });
  Account.find({'_id':{ $in: user_list}}).then(function(accounts){
    if(accounts.length !== user_list.length){
      return res.status(400).json({error:"Invalid user entered.", user_ids:user_list});
    }
    else{
      next();
    }
  })
  .catch(function(err){
    return res.status(400).json({error: "Error"});
  });
};

// update function for each user's account
// adds invited group to user's invited_groups_ids field
// if account update was successful, returns boolean (true)
// else, returns error message 
function asyncAccount(req, user_id){
  console.log('async')
  return Account.findById(user_id) 
    .then(async function(accountResult) {
      if(!accountResult){
        console.log('error', err);
        return "Account not found."
      }
      else {
        console.log('here1', req.params.group_id)
        if(accountResult.invited_groups_ids.indexOf(req.params.group_id) < 0){
          accountResult.invited_groups_ids.push(req.params.group_id);
          console.log('here2')
          accountResult.save(function(err){
            if (err){
              return "Update account model fail."
            } else {
              return true;
            }
          });
        }
        else {
          console.log(accountResult.invited_groups_ids, 
            accountResult.invited_groups_ids.indexOf(req.params.group_id))
          console.log('should be here')
          return "Account has already been invited.";
        }
      }

    }).catch(function(err){
      console.log('error', err)
      return "Unknown error when editing accounts"
    })
}

// Updates group to add new invited users to invited_user_ids
// Updates users with helper function asyncAccount
function UpdateGroupAndUsers(req, res, NewInvitedUserList, updated_user_ids){
  let fieldsToUpdate = {
    invited_user_ids:NewInvitedUserList
  };
  let tempDict = {}
  let user_result = "";

  // this is the data to be sent back as a response to detail which users
  // were successfully invited or not
  // succeeded list is just a list of successfully invited user_ids
  // failed is an object of user_ids as keys and error messages as values
  let user_results = {
    'succeeded': [],
    'failed': {}
  }

  // update the group model's invited_user_ids
  Group.findByIdAndUpdate({_id: req.params.group_id},{ $set: fieldsToUpdate }, 
    {multi: false, useFindAndModify: false }, async function (err, groupResult) {
    if(err){
      res.status(400).send({
        success: false,
        error: "Update group model fail."
      });
      return;
    } else {
      // update the invited_groups_ids in accounts that are updated
      // needed async/await because for loop is synchronous and db call is asynchronous
      for (let i = 0; i < updated_user_ids.length; ++i){
        user_result = await asyncAccount(req, updated_user_ids[i])

        // user_result can return either a string or an boolean
        // as specified above in declaration of user_result
        // and asyncAccount details

        console.log('promise',user_result)
        console.log(typeof user_result)
        
        if (typeof user_result === 'string'){
          console.log('should get here')
          tempDict = {} 
          tempDict[updated_user_ids[i]] = user_result;
          user_results['failed'] = Object.assign(user_results['failed'], tempDict);
        } else {
          user_results['succeeded'].push(updated_user_ids[i]);
        }
      }   

      // No successful invitations
      console.log('user_results:',user_results);
      if (user_results.succeeded.length === 0){
        // error
        res.status(400).send({
          success: false,
          error: "All invitations failed.",
          failed: user_results.failed
        });
      }
      else {
        // success
        res.status(200).send({
          success: true,
          succeeded: user_results.succeeded,
          failed: user_results.failed
        });
      }    
    }
  
  });
}

// Invite users based on list of user_ids given in body
groupRouter.patch("/invite/:group_id", [authMiddleware,verifyIds], (req, res, next) => {
  if(!req.params.group_id){
      return res.status(400).json({
          success:false,
          error:"Please indicate the group_id."
      });
  }
  added_invited_user_ids = req.body.user_ids;
  // NewInvitedUserList is the updated invited_user_ids in group model
  let NewInvitedUserList = [];
  // updated_user_ids are the collection of user_ids that are actually updated.
  let updated_user_ids = [];
  // check if the group exists and then find the new invited_user_ids.
  Group.findOne({'_id':req.params.group_id}, function(err, result){
    if(err || !result){
      res.status(400).json({
          success:false,
          error:"Invalid group_id. Please try another one."
      });
      return;
    }
    else{
      // add each othe user_ids to the invited_user_ids, without duplication
      try{

        // added_invited_user_ids: users that were requested to be added from body
        // NewInvitedUserList: current invited users in group + new invited users
        // updated_user_ids: users to update
        NewInvitedUserList = result._doc.invited_user_ids;
        console.log(NewInvitedUserList)
        added_invited_user_ids.forEach(function(userID) {
          // add to the list if not existed
          if(NewInvitedUserList.indexOf(userID) <0){
            NewInvitedUserList.push(userID);
            updated_user_ids.push(userID);
          }
        });

        // check whether the account is the group owner
        if(req.user.user_info.managed_groups_ids.indexOf(req.params.group_id) <0){
          // if the account is not the group manager, throw 403 error.
          return res.status(403).send({
            success: false,
            error: "Sorry, you are not the group owner."
          });
          // if updated_user_ids is 0 then no updates need to be made,
          // meaning all requested invites are already in the group
        } else if (updated_user_ids.length === 0) {
          res.status(400).send({
            success:false,
            error:"Requested users have already been invited!"
          });
          // NO ERRORS UP UNTIL THIS POINT
        } else {
          console.log(updated_user_ids)
          // 
          UpdateGroupAndUsers(req, res, NewInvitedUserList, updated_user_ids);
        }
      }
      catch(err){
        res.status(400).send({
          error:"adding error"
        });
      }
    }
  });

});

module.exports = groupRouter;