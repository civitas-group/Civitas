const express = require('express');
const authMiddleware = require('../middleware/auth');
var Group = require('../models/group.model');
var Account = require('../models/account.model');
var Announcement = require('../models/announcement.model');
const Post = require('../models/post.model');
const groupRouter = express.Router();
var jwt_decode = require('jwt-decode');
const helper = require('./helper.js')
const mongoose = require('mongoose');
const e = require('express');

/* 
  Query posts based on search term 
  /query?search=searchterm
*/
groupRouter.get('/query', authMiddleware, (req, res, next) => {

  Group.find(
    { "group_name": { "$regex": req.query.search, "$options": "i" } },
    function(err, result) { 
      if (err){
        res.status(400).send({
          success: false,
          error: JSON.stringify(err),
        });
        return;
      } else {
        res.status(200).send({
          success: true,
          results: result
        });
      }
    } 
  );
});

/* Approve group creation/admin join request as super admin */
/* req.body
  {
    group_id: string,
    user_id: string (user of admin requesting)
  }
  check if the user_id is supervisor if front-end doesn't check.
*/
groupRouter.post("/approve", authMiddleware,(req, res) => {
  let group_id = req.body.group_id;
  let user_id = req.body.user_id;
  let group_criteria = { _id: group_id }
  Group.findOne(group_criteria, function(groupErr, group){
    if(groupErr || !group){
      res.status(400).send({
        success: false,
        error: JSON.stringify(groupErr),
      });
    } else {
      let fieldsToUpdate;
      // If user is main supervisor (first one that created group),
      // set approved to true since group hasn't been aproved yet
      if (group.supervisor_id === user_id){
        fieldsToUpdate = { '$set': { 'is_approved': true } }
      }
      // If user is 2nd+ supervisor, group already approved; add user
      // to list of cosupervisor_ids
      else {
        if (group.cosupervisor_ids.indexOf(user_id) !== -1){
          res.status(400).send({
            success: false,
            error: "User already a supervisor."
          });
          return;
        }
        fieldsToUpdate = { '$push': { 'cosupervisor_ids': user_id } }
      }

      // Update group based on fieldsToUpdate
      Group.findByIdAndUpdate(group_criteria,
        fieldsToUpdate, { useFindAndModify: false, new: true },  
        function (accountErr, accountResult) {
          if(accountErr){
            res.status(400).send({
              success: false,
              error: JSON.stringify(accountErr)
              });
          } else {

            // Remove group_id from user's list of requested_groups_ids
            // and push group_id to user's list of managed_groups_ids
            fieldsToUpdate = { 
              '$pull': { 'requested_groups_ids': group._id },
              '$push': { 'managed_groups_ids': group._id }
            }

            // Update account based on fieldsToUpdate
            Account.findByIdAndUpdate(user_id,
              fieldsToUpdate, { useFindAndModify: false, new: true },  
              async function (accountErr, accountResult) {
                if(accountErr){
                  res.status(400).send({
                    success: false,
                    error: JSON.stringify(accountErr)
                    });
                } else {
                  await helper.pushNotification(user_id, 
                    'Your group creation request has been approved!'
                    + ' Navigate to groups to get started.')
                  res.status(201).send({
                    success: true,
                    created_group: accountResult
                  });
                }
            })
          }
      })


    }
  });
    
});
/* 
  The following objects are updated in user's accounts
    requested_groups_ids: the new group_id is added
    requested_groups_files: the following file_info are added
      {
        requested_group_id:{
            type: mongoose.ObjectId,
            ref: "Group"
        },
        fileInfo:{
          file_urls:[{
              type: String
          }],
          file_storage_type:{
             type: String
          }
        }
      }
*/
async function update_account(req,res,created_group_id,group_name){
  console.log(created_group_id, created_group_id._id)
  console.log(typeof created_group_id, typeof created_group_id._id)
  console.log(created_group_id.toString(), created_group_id._id.toString())
  // Update user account:
  let add_files = {
    requested_group_id: created_group_id._id,
    fileInfo:{
      file_urls: req.body.file_urls,
      file_storage_type: req.body.file_storage_type
    }
  }
  let fieldsToUpdate = {
    'requested_groups_files': add_files,
    'requested_groups_ids': created_group_id._id
  }
  // Update admin's managed_groups_ids list
  await Account.findByIdAndUpdate(req.user.user_info._id,
    { $addToSet: fieldsToUpdate },
    { useFindAndModify: false, new: true },  
    async function (accountErr, accountResult) {
      if(accountErr){
        res.status(400).send({
          success: false,
          error: JSON.stringify(accountErr)
          });
      } else {
        await helper.pushNotification(String(req.user.user_info._id), 
          'Your request to create ' + group_name + ' has been sent.')
        res.status(201).send({
          success: true,
          user: accountResult,
          msg: "Create/Join group request sent successfully"
        });
        return;
      }
  })
}

// Before sending admin's request to create group be added to existing
// group as admin, check if already requested or already group admin
// body : { 
//  group_name: string
// }
async function groupCreatePreflight(req, res, next){
  let decoded = jwt_decode(req.token);
  let username = decoded.username;
  let criteria = { username: username }
  let user_id = req.user.user_info._id;
  let group_criteria = { group_name: req.body.group_name }
  
  return await Group.findOne(group_criteria)
    .then(async function(group, err){ 
      // If group already exists, continue to main function 
      // with group_exists flag set to false
      if(err || !group){
        req.group_exists = false;
        return;
      }

      // If user is already supervisor of group, signal to frontend
      // Signal is 200 status code with msg detailing
      // (user_id === supervisor_id or in list of cosupervisor_ids) 
      if (group.supervisor_id.toString() === user_id.toString() || 
        group.cosupervisor_ids.indexOf(user_id.toString()) !== -1) {
        res.status(200).send({
          success: false,
          msg: "Already supervisor.",
        });
      } else {
        // If user has already requested to be group admin,
        // also signal to frontend 
        return await Account.findOne(criteria, function(accountErr, user){
          if(accountErr || !user){
            res.status(400).send({
              success: false,
              error: JSON.stringify(accountErr),
            });

          // User already requested
          } else if (user.requested_groups_ids.indexOf(group._id) !== -1) {
            res.status(200).send({
              success: false,
              msg: "Already requested."
            });

          // Everything good, continue to main with group_exists flag set
          } else {
            req.group_exists = true;
          }
        });
      } 
    })
    .catch(async function(err){
      return res.status(400).json({error: "Error"});
    });
}

/* Verify whether the admin is authorized to create/join a private group*/
/* group_exists = string, 'false', 'true'*/
/* req.body
{ group_name: string // required
  address: string // only required if group_exists === false
  file_urls: [string] // required, urls
  file_storage_type: string // required, Google Drive, Dropbox, etc
  is_private: boolean
}*/
groupRouter.post("/create", authMiddleware, async (req, res) => {

  await groupCreatePreflight(req, res); 
  // if response already sent - do not resend, return
  if (res.headersSent) return;

  let decoded = jwt_decode(req.token);
  let criteria = { username: decoded.username }
  // Find account based on username to ensure user is supervisor
  await Account.findOne(criteria, function(accountErr, user){
    if(accountErr || !user){
      res.status(400).send({
        success: false,
        error: JSON.stringify(accountErr),
      });
      return;
    // User not supervisor, cannot make announcement
    } else if (!user.is_supervisor) {
      res.status(401).send({
        success: false,
        error: "User not supervisor."
      });
      return;
    }
  });
  let created_group_id;
  /* If the group does not exist
  Create group with group_name, address, but still leaves it unverifed*/
  //Get Mongo ID of group
  if(req.group_exists === false){
    let newGroup = {
      group_name: req.body.group_name,
      supervisor_id: req.user.user_info._id,
      cosupervisor_ids: [],
      is_private: true,
      is_approved: false,
      address:req.body.address
    };
    Group.create(newGroup, async function(err, result) {
      if(err){
        if (JSON.stringify(err).includes('E11000')){
          res.status(409).send({
            success: false,
            error: 'E11000, Duplcate'
          });
        } else{
          res.status(400).send({
            success: false,
            error: 'Creating the group fail'
          });
        }
      } else {
        created_group_id = result._id;
        await update_account(req,res,created_group_id, 
          req.body.group_name);
        return;
      }
    });
  }
  /* If the group already exists(same group name), send the request to join the group
  */
  // Get Mongo ID of existed group
  else {
    group_info = {group_name: req.body.group_name}
    Group.findOne(group_info, function(groupFindErr, groupFind){
      if(groupFindErr || !groupFind){
        res.status(400).send({
          success:false,
          error: JSON.stringify(groupFindErr),
        });
        return;
      // Successful so far
      } else {
        created_group_id = groupFind._id;
        update_account(req,res,created_group_id, 
          req.body.group_name);
        return;
      }
    });
  }
})

// Get group info, posts in group, announcements in group, and user's groups list
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

          // append info to result
          console.log(group)
          full = Object.assign(full, {
            group_name: group.group_name,
            address: group.address,
            supervisor_id: group.supervisor_id,
            cosupervisor_ids: group.cosupervisor_ids,
            user_ids: group.user_ids,
            invited_user_ids: group.invited_user_ids,
            requested_to_join_user_ids: group.requested_to_join_user_ids
          })

          // Get all posts in group
          Post.find().where('_id')
          .in(group.post_ids)
          .sort({'created': -1})
          .exec((err, records) => {
            if (err || !records){
              res.status(400).send({
                success:false,
                error: err
              });
              return;
            } else {
              full = Object.assign(full, {
                posts: records
              })  

              // Get all posts in group
              Announcement.find().where('_id').in(
                group.announcement_ids).exec((announceErr, announceRecords) => {
                if (announceErr || !announceRecords){
                  res.status(400).send({
                    success: false,
                    error: announceErr
                  });
                  return;
                } else {
                  //console.log(full)
                  full = Object.assign(full, {
                    announcements: announceRecords,
                  })
                  res.json(full);
                  return;
                }
              });
              //res.json(full);
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
function asyncAccount(req, user_id, group_name){
  console.log('async')
  return Account.findById(user_id) 
    .then(async function(accountResult) {
      if(!accountResult){
        console.log('error', err);
        return "Account not found."
      }
      else if (accountResult.is_supervisor){
        return "Account is supervisor."
      }
      else {
        console.log('here1', req.params.group_id)
        if(accountResult.invited_groups_ids.indexOf(req.params.group_id) < 0){
          accountResult.invited_groups_ids.push(req.params.group_id);
          console.log('here2')
          accountResult.save(async function(err){
            if (err){
              return "Update account model fail."
            } else {
              await helper.pushNotification(user_id, 
                'Your have been invited to join ' + group_name 
                + '! Navigate to groups and enter the group id: '
                 + req.params.group_id + ' in the Join Group field.')
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
        user_result = await asyncAccount(req, updated_user_ids[i], 
          groupResult.group_name)

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

/*This api can be used as the api for user to join after its request is approved*/
groupRouter.patch("/join/:group_id", authMiddleware, (req, res, next) => {
	if(!req.params.group_id){
      return res.status(400).json({
          success:false,
          error:"Please indicate the group_id."
      });
	}
	Group.findOne({'_id':req.params.group_id}).then(function(result){
      if(!result){
        res.status(400).json({
            success:false,
            error:"Invalid group_id. Please try another one."
        });
        return;
      }
	    else if(result.user_ids.indexOf(req.user.user_info._id) >=0){
		    // if the member has already become a group member
		    res.status(400).json({
				  success:false,
				  error:"Sorry, the group account shows you are currently inside the group."
		  	});
		    return;
	    }
      else{
        let userId = req.user.user_info._id
        let new_user_ids = result.user_ids;
        new_user_ids.push(userId);
		    // if we find the group, check whether the user is invited
		    if(result.invited_user_ids.indexOf(userId) < 0){
			    res.status(400).json({
				    success:false,
				    error:"Sorry, you are not invited."
			    });
			    return;
		    }
		    else{
          let deleteIndex = result.invited_user_ids.indexOf(userId)
          let new_invited_user_ids = result.invited_user_ids;
          new_invited_user_ids.splice(deleteIndex,1);
			    // if it is, check whether the user account exists
			    Account.findOne(userId,  
            function (accountErr, accResult) {
              if(accountErr || !accResult){
                res.status(400).send({
                  success: false,
					        error:"Fail to find the user account"
                });
                return;
              } else {
				      	// check again whether the user is in the group
                  New_group_ids = accResult.group_ids;
					        if(New_group_ids.indexOf(req.params.group_id) >=0){
						        res.status(400).send({
							        success: false,
							        error:"Sorry, the account shows you are already in the group"
                    });
                    return;
				        	}
					        else{
                    let groupId = req.params.group_id;
						        // update the account's invited_groups_ids
                    // check whether account's invited_groups_ids has the group_id
                    if(accResult.invited_groups_ids.indexOf(groupId)<0){
                      // if the group_id is not in the invited_groups_ids, 
                      //throw ann error
                      res.status(400).send({
                        success: false,
                        error:"Sorry, the account info shows you are not invited."
                      });
                      return;
                    }
                    else{
                      let index = accResult.invited_groups_ids.indexOf(groupId);
                      // delete the group_id from invited_groups_ids
                      let new_group_ids = accResult.invited_groups_ids.splice(index,1);
                      let update_fields = {invited_groups_ids: new_group_ids};
                      console.log("step 1");
                      Account.findByIdAndUpdate(accResult._id, 
                        { $set: update_fields},
                        { useFindAndModify: false, new: true },
                        function(updateErr, acc_update_result){
                          if (updateErr){
                            res.status(400).send({
                              success: false,
                              error:"Failed to delete the group_ids."
                            });
                            return;
                          }
                          else{
                            console.log("step 2");
                            // update the user_ids in the account model
                            accResult.group_ids.push(groupId);
									          accResult.save(function(err){
										          if (err){
											          res.status(400).send({
												          success: false,
												          error:"Failed to add the group_ids."
											          });
											          return;
                              } else {;
                                  console.log("step 3");
                                  // update the invited_user_ids and user_ids in the group model
											            UpdateGroupForJoin(req, res,new_user_ids,
                                    new_invited_user_ids, 
                                    acc_update_result.username);
										          }	
									          });	
								          }
								        }
							        );
                    } 
                  }
                }
            });
		    }
      }
      //NewInvitedUserList = result.invited_user_ids.push(req.params.user_id);
  }).catch(function(err){
    console.log('ERR',err)
      res.status(400).send({
        success:false,
        error: "General error."
      });  
  });
});

function UpdateGroupForJoin(req, res, new_user_ids, new_invited_user_ids, 
  username){
  // update the group's invited_user_ids and user_ids
  let updated_fields = {user_ids : new_user_ids,
                        invited_user_ids : new_invited_user_ids};
  console.log("step 4");
  Group.findByIdAndUpdate(req.params.group_id, 
    { $set: updated_fields},
    { useFindAndModify: false, new: true },
    async function(updateErr, group_update_result){
      if(updateErr){
        res.status(400).send({
          success: false,
          error:"Fail to update the group model",
          err:updateErr.msg
        });
        return;
      }
      else{
        console.log("step 5");
        await helper.pushNotificationToSupervisors(group_update_result, 
          username + ' has joined your group!')
        res.status(200).send({
          success: true,
          msg:"Joined the group successfully",
          group:group_update_result
        });
        return;
      }
    }
  );
}
/*
  This api enables users to sent a request to join a private group.
  Add group_id to requested_to_join_groups_ids in account.model
  Add user_id to requested_to_join_user_ids in group.model

  req.body is not used, group_id of the group is passed in req.params
*/
groupRouter.patch("/user_request/:group_id", authMiddleware, (req, res, next)=>{
  if(!req.params.group_id){
    return res.status(400).json({
        success:false,
        error:"Please indicate the group_id."
    });
  }
  var decoded = jwt_decode(req.token);
  var user_info = {username: decoded.username}
  Group.findOne({'_id':req.params.group_id}).then(function(result){
    if(!result){
      res.status(400).json({
          success:false,
          error:"Invalid group_id. Please try another one."
      });
      return;
    }
    else if(result.user_ids.indexOf(req.user.user_info._id) >=0){
      // if the member has already become a group member
      res.status(400).json({
        success:false,
        error:"Sorry, you are currently inside the group."
      });
      return;
    }
    else{
      update = {
        $push: {requested_to_join_groups_ids: req.params.group_id}
      },
      options = {
        useFindAndModify: false
      };
      Account.findOneAndUpdate(user_info, update, options, 
        (accountUpdateErr, updatedAccount) => {
        if(!updatedAccount || accountUpdateErr){
          res.status(400).send({
              success:false,
              error: JSON.stringify(commentFindErr)
          });
          return;
        }
        else{
          // update the group, add user_ids inside requested_to_join_user_ids
          var group_info = {
            '_id': req.params.group_id
          },
          updateGroup = {
            $push: {requested_to_join_user_ids: updatedAccount._id}
          },
          options = {
            useFindAndModify: false
          };
          Group.findOneAndUpdate(group_info, updateGroup, options, 
            async (groupUpdateErr, updatedGroup) => {
            if(!updatedGroup || groupUpdateErr){
              res.status(400).send({
                  success:false,
                  error: JSON.stringify(commentFindErr)
              });
              return;
            }
            else {
              await helper.pushNotificationToSupervisors(updatedGroup, 
                user_info.username + ' has requested to join your group. '
                + 'Visit the administrator console for further action.')

              res.status(200).send({
                success:true,
                msg:"Joining request sent successfully."
              });
              return;
            }
          })
        }
      })
    }
  });
});

/*
  Call this api if the admin approves the request for user to join in a group
  delete group_id from requested_to_join_groups_ids, add to groups_ids in account.model
  delete user_id from requested_to_join_user_ids, add to user_ids in group.model

  user_id are passed in req.body
*/
groupRouter.patch("/accept_user_request/:group_id", authMiddleware, (req, res, next) =>{
  if(!req.body.user_id){
    return res.status(400).json({
      success:false,
      error:"Please indicate the user_id you want to accept into the group."
    });
  }
  else if(!req.params.group_id){
    return res.status(400).json({
      success:false,
      error:"Please indicate the group_id you want to modify."
    });
  }
  else{
    var decoded = jwt_decode(req.token);
    let admin_id =  req.user.user_info._id
    Group.findOne({'_id':req.params.group_id}, (err,result) =>{
      if(err || !result){
        res.status(400).json({
            success:false,
            error:"Invalid group_id. Please try another one."
        });
        return;
      }
      else if(result.supervisor_id.equals(admin_id) === false && 
        result.cosupervisor_ids.indexOf(admin_id) < 0){
          res.status(400).json({
            success:false,
            error:"Sorry, you are not the admin of the group."
          });
          return;
         }
      else if(result.user_ids.indexOf(req.body.user_id) >=0){
        // if the user has already become a group member
        res.status(400).json({
          success:false,
          error:"Sorry, the user is currently inside the group."
        });
        return;
      }
      else{
        var user_info = {
          '_id': req.body.user_id
        },
        update = {
          // delete
          $pull: {requested_to_join_groups_ids: req.params.group_id},
          // add
          $push: {group_ids: req.params.group_id}
        },
        options = {
          useFindAndModify: false
        };
        Account.findOneAndUpdate(user_info, update, options, (accountErr, updatedAcc) => {
          if(accountErr || !updatedAcc){
            res.status(400).send({
              success:false,
              error: JSON.stringify(accountErr),
              msg:"Fail to update the account"
            });
            return;
          }
          else{
            // update the group info
            var group_info = {
              '_id': req.params.group_id
            },
            update = {
              $push: {user_ids: req.body.user_id},
              // delete
              $pull: {requested_to_join_user_ids: req.body.user_id}
            },
            options = {
              useFindAndModify: false
            };
            Group.findOneAndUpdate(group_info, update, options, 
              async (groupErr, groupRes) => {
              if(groupErr || !groupRes){
                res.status(400).send({
                  success:false,
                  error: JSON.stringify(groupErr),
                  msg:"Fail to update the group"
                });
                return;
              }
              else{
                await helper.pushNotification(req.body.user_id, 
                  'Your request to join ' + groupRes.group_name + 
                  ' has been approved! Navigate to groups to get started.')
                res.status(200).send({
                  success:true,
                  msg:"Successfully added the user to the requested group."
                })
                return;
              }
            })
          }
        })
      }
    });
  }
});

/* If a user's join group request gets rejected by admin, calls this api
  delete group_id from requested_to_join_groups_ids in account  
  delete user_id from requested_to_join_user_ids in group
  user_id are passed in req.body
*/
groupRouter.patch("/deny_user_request/:group_id", authMiddleware, (req, res, next) =>{
  if(!req.body.user_id){
    return res.status(400).json({
      success:false,
      error:"Please indicate the user_id you want to reject from the group ."
    });
  }
  else if(!req.params.group_id){
    return res.status(400).json({
      success:false,
      error:"Please indicate the group_id you want to modify."
    });
  }
  else{
    var decoded = jwt_decode(req.token);
    let admin_id =  req.user.user_info._id
    Group.findOne({'_id':req.params.group_id},(err,result) =>{
      if(err || !result){
        res.status(400).json({
            success:false,
            error:"Invalid group_id. Please try another one."
        });
        return;
      }
      else if(result.supervisor_id.equals(admin_id) === false && 
        result.cosupervisor_ids.indexOf(admin_id) < 0){
          res.status(400).json({
            success:false,
            error:"Sorry, you are not the admin of the group."
          });
          return;
      }
      else if(result.user_ids.indexOf(req.body.user_id) >=0){
        // if the user has already become a group member
        res.status(400).json({
          success:false,
          error:"Sorry, the user is currently inside the group."
        });
        return;
      }
      else{
        // update the account info
        // delete group_id from requested_to_join_groups_ids in account 
        var user_info = {
          '_id': req.body.user_id
        },
        update = {
          // delete
          $pull: {requested_to_join_groups_ids: req.params.group_id}
        },
        options = {
          useFindAndModify: false
        };
        Account.findOneAndUpdate(user_info, update, options, (accountErr, updatedAcc) => {
          if(accountErr || !updatedAcc){
            res.status(400).send({
              success:false,
              error: JSON.stringify(accountErr),
              msg:"Fail to update the account"
            });
            return;
          }
          else{
            // update the group info
            // delete user_id from requested_to_join_user_ids in group
            var group_info = {
              '_id': req.params.group_id
            },
            update = {
              // delete
              $pull: {requested_to_join_user_ids: req.body.user_id}
            },
            options = {
              useFindAndModify: false
            };
            Group.findOneAndUpdate(group_info, update, options, 
              async (groupErr, groupRes) => {
              if(groupErr || !groupRes){
                res.status(400).send({
                  success:false,
                  error: JSON.stringify(groupErr),
                  msg:"Fail to update the group"
                });
                return;
              }
              else{
                await helper.pushNotification(req.body.user_id, 
                  'Sorry, your request to join ' + groupRes.group_name + 
                  ' has been denied. Please contact your administrator if you'
                  + ' believe this to be an issue, or contact'
                  + ' civitasmain@gmail.com.')
                res.status(200).send({
                  success:true,
                  msg:"The user has been rejected to join the group."
                })
                return;
              }
            });
          }
        });
      }
    });
  }
});
// set the denied field to true.

/* add new apis
// combined api for user_request and join

// delete from requested_to_join_groups_ids, add to groups_ids in account.model
// delete from requested_to_join_user_ids add to user_ids in group.model
// send notification
groupRouter.patch("/accept_user_request/:group_id", authMiddleware, (req, res, next)

// delete from requested_to_join_groups_ids, delete from requested_to_join_user_ids
// send notification
groupRouter.patch("/deny_user_request/:group_id", authMiddleware, (req, res, next)
// set the denied field to true.

/*
  For the notification system:
  admin: user's join group request, user is accepted/rejected for request (creating group approved)
  user: get invited to join a group, admin's responce for joining group request

  // new comment for post????
*/
module.exports = groupRouter;