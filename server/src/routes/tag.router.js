const express  = require('express');
const authMiddleware = require('../middleware/auth');
const tagRouter = express.Router();
const Post = require('../models/post.model'); 
const Group = require('../models/group.model');
var Account =  require('../models/account.model');
var jwt_decode = require('jwt-decode');

/*Group admin add a tag to the group
    req.body:{
        group_id: mongoose.ObjectId of "Group"
        tag_name: string
    }
*/ 
tagRouter.patch("/add",authMiddleware,(req,res,next) => {
    if(!req.body.group_id){
        res.status(400).send({
            success:false,
            error:"Please enter the group_id."
        });
        return;
    }
    if(!req.body.tag_name){
        res.status(400).send({
            success:false,
            error:"Please enter the tag_name."
        });
        return;
    }
    var decoded = jwt_decode(req.token);
    var user_info = {username: decoded.username}
    Account.findOne(user_info, function(accountErr, user){
        if(accountErr || !user){
          res.status(400).send({
            success:false,
            error: 'The account does not exist',
          });
          return;
        } else {
            var criteria ={_id:req.body.group_id};
            Group.findOne(criteria, function(groupFindErr, groupFind){
                if(groupFindErr || !groupFind){
                  res.status(400).send({
                    success:false,
                    error: 'The group does not exist',
                  });
                  return;
                } 
                // check whether the user is the group_supervisor
                else if(user.managed_groups_ids.indexOf(groupFind._id) === -1){
                    return res.status(403).send({
                        success:false,
                        error: "Sorry, you are not authorized to create the tag"
                    });
                }
                // check whether the tag has been created
                else if(groupFind.tags.findIndex(i => i.key === req.body.tag_name) !== -1){
                    res.status(400).send({
                        success:false,
                        error: 'The tag has been created',
                    });
                    return;
                }
                else {
                    var new_tag ={
                        key:req.body.tag_name,
                        post_ids:[]
                    }
                    var fieldsToUpdate = {'$push': {tags: new_tag}};
                    Group.findByIdAndUpdate(req.body.group_id,
                    fieldsToUpdate, { useFindAndModify: false },
                    function (groupUpdateErr, groupUpdateResult) {
                        if(groupUpdateErr || !groupUpdateResult){
                            res.status(400).send({
                              success:false,
                              error: 'Update group failed',
                            });
                            return;
                        } 
                        else{
                            res.status(201).send({
                                success: true,
                                message: "Tag created successfully"
                            });
                        }
                    })
                }
            })
        }
    })
})
/*Group admin delete a tag in the group
    req.body:{
        group_id: mongoose.ObjectId of "Group"
        tag_name: string
    }
*/
tagRouter.patch("/delete",authMiddleware,(req,res,next) => {
    if(!req.body.group_id){
        res.status(400).send({
            success:false,
            error:"Please enter the group_id."
        });
        return;
    }
    if(!req.body.tag_name){
        res.status(400).send({
            success:false,
            error:"Please enter the tag_name."
        });
        return;
    }
    var decoded = jwt_decode(req.token);
    var user_info = {username: decoded.username}
    Account.findOne(user_info, function(accountErr, user){
        if(accountErr || !user){
          res.status(400).send({
            success:false,
            error: 'The account does not exist',
          });
          return;
        } else {
            var criteria ={_id:req.body.group_id};
            Group.findOne(criteria, function(groupFindErr, groupFind){
                if(groupFindErr || !groupFind){
                  res.status(400).send({
                    success:false,
                    error: 'The group does not exist',
                  });
                  return;
                } 
                // check whether the user is the group_supervisor
                else if(user.managed_groups_ids.indexOf(groupFind._id) === -1){
                    return res.status(403).send({
                        success:false,
                        error: "Sorry, you are not authorized to delete the tag"
                    });
                }
                // check whether the tag exists
                else if(groupFind.tags.findIndex(i => i.key === req.body.tag_name) === -1){
                    res.status(400).send({
                        success:false,
                        error: 'The tag does not exist',
                    });
                    return;
                }
                else {
                    var deleted_tag ={
                        key:req.body.tag_name
                    }
                    var fieldsToUpdate = {'$pull': {"tags" : {"key":req.body.tag_name}}};
                    // delete the tag from the group
                    Group.findByIdAndUpdate(req.body.group_id,
                    fieldsToUpdate, { useFindAndModify: false },
                    function (groupUpdateErr, groupUpdateResult) {
                        if(groupUpdateErr || !groupUpdateResult){
                            res.status(400).send({
                              success:false,
                              error: 'Update group failed',
                            });
                            return;
                        } 
                        else{
                            res.status(200).send({
                                success: true,
                                message: "Tag deleted successfully"
                            });
                        }
                    })
                }
            })
        }
    })
})
/*User add a tag to a post*/

/*Group admin or tag author deletes a tag to post*/

module.exports = tagRouter;