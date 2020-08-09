const express  = require('express');
const authMiddleware = require('../middleware/auth');
const tagRouter = express.Router();
const Post = require('../models/post.model'); 
const Group = require('../models/group.model');
var Account =  require('../models/account.model');
var jwt_decode = require('jwt-decode');

/*Group admin edit group's tags
    req.body:{
        group_id: mongoose.ObjectId of "Group"
        tag_names: [string]
    }
*/ 
tagRouter.patch("/edit_group_tags",authMiddleware,(req,res,next) => {
    if(!req.body.group_id){
        res.status(400).send({
            success:false,
            error:"Please enter the group_id."
        });
        return;
    }
    if(!req.body.tag_names){
        res.status(400).send({
            success:false,
            error:"Please enter the new tag_list."
        });
        return;
    }
    var decoded = jwt_decode(req.token);
    var criteria ={_id:req.body.group_id};
    var user_info = {username: decoded.username}
    Account.findOne(user_info, function(accountErr, user){
        if(accountErr || !user){
          res.status(400).send({
            success:false,
            error: 'The account does not exist',
          });
          return;
        }
        else{
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
                else {
                    var old_tags = groupFind.tags
                    var existed_tag_list ={}
                    // Apply is_deleted to track tags that are removed
                    var is_deleted = Array(old_tags.length).fill(1);
                    var i;
                    // search for existing tags
                    for (i = 0; i < req.body.tag_names.length; i++) {
                        for (j =0; j<old_tags.length;j++){
                            if (old_tags[j]['key'] == req.body.tag_names[i]){
                                existed_tag_list[req.body.tag_names[i]] = j
                                is_deleted[j] = 0
                                break
                            }
                        }
                    }
                    var new_tags =[]
                    for (i = 0; i < req.body.tag_names.length; i++) {
                        let tag_name = req.body.tag_names[i]
                        // if existed, use the original post_ids
                        if (tag_name in existed_tag_list){
                            let index = existed_tag_list[tag_name]
                            let new_tag ={
                                key:tag_name,
                                post_ids:old_tags[index]['post_ids']
                            }
                            new_tags.push(new_tag)
                        }
                        // if not, create the new one
                        else{
                            let new_tag ={
                                key:tag_name,
                                post_ids:[]
                            }
                            new_tags.push(new_tag)
                        }
                    }
                    var fieldsToUpdate = {'$set':{"tags":new_tags}};
                    // update the Group database
                    Group.findByIdAndUpdate(req.body.group_id,
                    fieldsToUpdate, { useFindAndModify: false },
                    async function (groupUpdateErr, groupUpdateResult) {
                        if(groupUpdateErr || !groupUpdateResult){
                            res.status(400).send({
                                success:false,
                                error: 'Update group failed',
                            });
                            return;
                        } 
                        else{
                            // update Post database
                            // delete post tags of those not-existing
                            var post_results = {
                                'succeeded': [],
                                'failed': []
                            }
                            var deleted_tag_num = 0
                            for (i = 0; i < is_deleted.length; i++) {
                                if(is_deleted[i] === 1){
                                    deleted_tag_num +=1 
                                    let tag_name = old_tags[i]['key']
                                    let post_ids_for_tag_deletion = old_tags[i]['post_ids']
                                    // delete the tag from posts
                                    let post_fields_to_update ={'$pull':{"tags_info":{"tag_name":tag_name}}}
                                    for (let i = 0; i < post_ids_for_tag_deletion.length; ++i){
                                        let post_id = post_ids_for_tag_deletion[i]['post_id']
                                        let delete_res = await delete_in_post(req,res,post_fields_to_update,post_id)
                                        if (typeof delete_res === 'string'){
                                            post_results['failed'].push(post_id)
                                        }
                                        else{
                                            post_results['succeeded'].push(post_id)
                                        }
                                    }
                                }
                            }
                            if(post_results['succeeded'].length === 0 && deleted_tag_num !== 0){
                                res.status(400).send({
                                    success:false,
                                    error:"Deleting non-existing post tags failed."
                                });
                                return;
                            }
                            else{
                                res.status(200).send({
                                    success:true,
                                    error:"Editing tags succeeded.",
                                    failed_posts: post_results['failed'],
                                    succeeded_posts:post_results['succeeded']
                                });
                                return;
                            }
                        }
                    })
                }
            })
        }   
    })
})

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

/*
    After a tag gets deleted by an admin, post tags ahould also be updated
    This is the method for it.

    post_ids: the list of posts that needs tag deletion
*/
async function delete_in_post(req, res, post_fields_to_update, post_id){
    return new Promise((resolve, reject) => {
        Post.findByIdAndUpdate(post_id,post_fields_to_update, { useFindAndModify: false },  
          function (postUpdateErr, postUpdateResult) {
            if(postUpdateErr){
              reject("Deleting the post tag failed")
            } else {
              resolve(true)
            }
        })
    })
}

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
                    // this is the post_ids of posts that we want to delete the tag
                    let tag_index = groupFind.tags.findIndex(i => i.key === req.body.tag_name)
                    var post_ids_for_tag_deletion = groupFind['tags'][tag_index]['post_ids']
                    // delete the tag from the group
                    Group.findByIdAndUpdate(req.body.group_id,
                    fieldsToUpdate, { useFindAndModify: false },
                    async function (groupUpdateErr, groupUpdateResult) {
                        if(groupUpdateErr || !groupUpdateResult){
                            res.status(400).send({
                              success:false,
                              error: 'Update group failed',
                            });
                            return;
                        } 
                        else{
                            // delete the tag from posts
                            let post_results = {
                                'succeeded': [],
                                'failed': []
                            }
                            var post_fields_to_update ={'$pull':{"tags_info":{"tag_name":req.body.tag_name}}}
                            for (let i = 0; i < post_ids_for_tag_deletion.length; ++i){
                                let post_id = post_ids_for_tag_deletion[i]['post_id']
                                let delete_res = await delete_in_post(req,res,post_fields_to_update,post_id)
                                if (typeof delete_res === 'string'){
                                    post_results['failed'].push(post_id)
                                }
                                else{
                                    post_results['succeeded'].push(post_id)
                                }
                            }
                            if(post_results['succeeded'].length === 0){
                                res.status(400).send({
                                    success:false,
                                    error:"Deleting all post's tag failed."
                                });
                                return;
                            }
                            else{
                                res.status(200).send({
                                    success:true,
                                    error:"Deleting the group's tag succeeded.",
                                    failed_posts: post_results['failed'],
                                    succeeded_posts:post_results['succeeded']
                                });
                                return;
                            }
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

/* edit a post's tags 
    Assuming all tags in tag_names exist and user is the group admin/tag author, 
    thereby having the rights to modify them

    req.body:{
        post_id: mongoose.ObjectId of "post"
        group_id: mongoose.ObjectId of "group"
        tag_names: [string]
    }
*/ 
tagRouter.patch("/edit_post_tag",authMiddleware,(req,res,next) => {
    // check required post_id, group_id, tag_names
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
    if(!req.body.tag_names){
        res.status(400).send({
            success:false,
            error:"Please provide the new list of tags."
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
                // update both the post and group
                else{
                    var new_tags = groupFind.tags
                    // use is_deleted_tags to track which of the old tags are deleted
                    let is_deleted_tags = Array(postFind.tags_info.length).fill(1);
                    for (j = 0; j < req.body.tag_names.length; j++) {
                        let tag_index = groupFind.tags.findIndex(i => i.key === req.body.tag_names[j])
                        let index_in_postFind = postFind.tags_info.findIndex(i => i.tag_name === req.body.tag_names[j])
                        is_deleted_tags[index_in_postFind] = 0
                        // add to that are not existed
                        let post_index = new_tags[tag_index]['post_ids'].findIndex
                        (i => i.post_id.toString() === req.body.post_id.toString())
                        if(post_index === -1){
                            new_tags[tag_index]['post_ids'].push({"post_id":req.body.post_id})
                        }
                    }
                    // delete tags that are now missing in Group db
                    for (k = 0; k < is_deleted_tags.length; k++) {
                        if(is_deleted_tags[k] === 1){
                            let tag_name = postFind.tags_info[k]['tag_name']
                            let tag_index = new_tags.findIndex(i => i.key === tag_name)
                            let post_index = new_tags[tag_index]['post_ids'].indexOf({"post_id":req.body.post_id})
                            new_tags[tag_index]['post_ids'].splice(post_index,1)
                        }
                    }
                    var group_fields_to_update = {'$set':{"tags":new_tags}}
                    // update the post
                    var new_tags_info = []
                    for (i = 0; i < req.body.tag_names.length; i++) {
                        let tag_info ={"tag_name":req.body.tag_names[i],"author":decoded.username}
                        new_tags_info.push(tag_info)
                    }
                    var post_fields_to_update ={'$set':{"tags_info":new_tags_info}}
                    //{'$pull': {"tags" : {"key":req.body.tag_name}}};
                    UpdateGroupandPost(req,res,group_fields_to_update,post_fields_to_update)
                }
            })
        }
    })
})


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