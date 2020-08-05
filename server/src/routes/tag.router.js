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

/*
    Update the db of Post and Group for user to add/delete a post's tag.
*/
function UpdateGroupandPost(req, res, group_fields_to_update, post_fields_to_update){
    Group.findByIdAndUpdate(req.body.group_id,
        group_fields_to_update, { useFindAndModify: false },
        function (groupUpdateErr, groupUpdateResult) {
            if(groupUpdateErr || !groupUpdateResult){
                res.status(400).send({
                  success:false,
                  error: 'Update group failed',
                });
                return;
            } 
            else{
                Post.findByIdAndUpdate(req.body.post_id,
                    post_fields_to_update, { useFindAndModify: false },
                    function (postUpdateErr, postUpdateResult) {
                        if(postUpdateErr || !postUpdateResult){
                            res.status(400).send({
                              success:false,
                              error: 'Update post failed',
                            });
                            return;
                        } 
                        else{
                            res.status(200).send({
                                success: true,
                                message: "Tag added/deleted successfully."
                            });
                        }
                })
            }
    })
}

/*User add a tag to a post
    req.body:{
        post_id: mongoose.ObjectId of "post"
        group_id: mongoose.ObjectId of "group"
        tag_name: string
    }
*/
tagRouter.patch("/add_to_post",authMiddleware,(req,res,next) => {
    // check required post_id, group_id, tag_name
    if(!req.body.post_id){
        res.status(400).send({
            success:false,
            error:"Please enter the post_id."
        });
        return;
    }
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
    var criteria ={_id:req.body.post_id};
    Post.findOne(criteria, function(postFindErr, postFind){
        if(postFindErr || !postFind){
            res.status(400).send({
                success:false,
                error: 'The post does not exist',
            });
            return;
        }
        // check whether the tag has been added to the post
        else if(postFind.tags_info.findIndex(i => i.tag_name === req.body.tag_name) !== -1){
            res.status(400).send({
                success:false,
                error: 'The tag has been added to the post.',
              });
            return;
        }
        else{
            var group_info ={_id:req.body.group_id};
            Group.findOne(group_info, function(groupFindErr, groupFind){
                if(groupFindErr || !groupFind){
                    res.status(400).send({
                      success:false,
                      error: 'The group does not exist',
                    });
                    return;
                }
                // check whether the tag exists in the group
                else if(groupFind.tags.findIndex(i => i.key === req.body.tag_name) === -1){
                    res.status(400).send({
                        success:false,
                        error: 'The group does not have this tag',
                    });
                    return;
                }
                // update both the post and group
                else{
                    var tag_index = groupFind.tags.findIndex(i => i.key === req.body.tag_name)
                    var new_tags = groupFind.tags
                    new_tags[tag_index]['post_ids'].push({"post_id":req.body.post_id})
                    var group_fields_to_update = {'$set':{"tags":new_tags}}
                    var tag_info ={"tag_name":req.body.tag_name,"author":decoded.username}
                    var post_fields_to_update ={'$push':{"tags_info":tag_info}}
                    //{'$pull': {"tags" : {"key":req.body.tag_name}}};
                    UpdateGroupandPost(req,res,group_fields_to_update,post_fields_to_update)
                }
            })
        }
    })
    
})

/*Group admin or tag author deletes a post's tag 
   req.body:{
        post_id: mongoose.ObjectId of "post"
        group_id: mongoose.ObjectId of "group"
        tag_name: string
   }

*/
tagRouter.patch("/delete_from_post",authMiddleware,(req,res,next) => {
    if(!req.body.post_id){
        res.status(400).send({
            success:false,
            error:"Please enter the post_id."
        });
        return;
    }
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
    var user_id = req.user.user_info._id;
    var criteria ={_id:req.body.post_id};
    Post.findOne(criteria, function(postFindErr, postFind){
        if(postFindErr || !postFind){
            res.status(400).send({
                success:false,
                error: 'The post does not exist',
            });
            return;
        }
        // check whether the tag has been added to the post
        else if(postFind.tags_info.findIndex(i => i.tag_name === req.body.tag_name) === -1){
            res.status(400).send({
                success:false,
                error: 'The post does not have the tag. Delete Failed',
              });
            return;
        }
        else{
            var group_info ={_id:req.body.group_id};
            var post_index = postFind.tags_info.findIndex(i => i.tag_name === req.body.tag_name)
            var tag_author = postFind.tags_info[post_index]["author"]
            Group.findOne(group_info, function(groupFindErr, groupFind){
                if(groupFindErr || !groupFind){
                    res.status(400).send({
                      success:false,
                      error: 'The group does not exist',
                    });
                    return;
                }
                // check whether the tag exists in the group
                else if(groupFind.tags.findIndex(i => i.key === req.body.tag_name) === -1){
                    res.status(400).send({
                        success:false,
                        error: 'The group does not have this tag',
                    });
                    return;
                }
                // check whether the user is the tag author or group admin
                // otherwise, they are not authorized to delete the tag
                else if(tag_author !== decoded.username &&
                    groupFind.supervisor_id.toString() !== user_id.toString() &&
                    groupFind.cosupervisor_ids.indexOf(user_id.toString()) === -1){
                        res.status(401).send({
                            success:false,
                            error: 'Sorry, you are not authorized to delete this tag',
                        });
                        return;
                }
                else{
                    // update both the post and group
                    var tag_index = groupFind.tags.findIndex(i => i.key === req.body.tag_name)
                    var new_tags = groupFind.tags
                    var post_index = new_tags[tag_index]['post_ids'].indexOf({"post_id":req.body.post_id})
                    new_tags[tag_index]['post_ids'].splice(post_index,1)
                    var group_fields_to_update = {'$set':{"tags":new_tags}}
                    var post_fields_to_update ={'$pull':{"tags_info":{"tag_name":req.body.tag_name}}}
                    //{'$pull': {"tags" : {"key":req.body.tag_name}}};
                    UpdateGroupandPost(req,res,group_fields_to_update,post_fields_to_update)
                }
            })
        }
    })
})
module.exports = tagRouter;