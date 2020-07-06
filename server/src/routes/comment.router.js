// Routes for Comments

const express = require('express');
const commentRouter = express.Router();
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
var  Group = require('../models/group.model');
var Account =  require('../models/account.model');
const authMiddleware = require('../middleware/auth');

/* Make a comment on a post */
commentRouter.post('/create-comment', authMiddleware, (req, res) => {
    // TODO: check that user making req has proper permissions to comment on the specificed post
    let newComment = {
        author: req.body.author,
        is_reply: req.body.is_reply,
        text: req.body.text,
        created: Date.now(),
        post_owner: req.body.post_owner
    };

    // create the comment, append it in the parent post's comments
    Comment.create(newComment, (err, createdComment) => {
        if (err) {
            console.log("500 #1 ", err);
            return res.status(500).send({
                success: false,
                error: JSON.stringify(err)
            });
        }

        // find and update the post
        var filter = {
            '_id': req.body.post_id
        },
        update = {
            $push: {comment_ids: createdComment._id}
        },
        options = {
            useFindAndModify: false
        };

        Post.findOneAndUpdate(filter, update, options, (postUpdateErr, updatedPost) => {
            if (err) {
                console.log("500 #2 ", err);
                return res.status(500).send({
                    success: false,
                    error: JSON.stringify(postUpdateErr)
                });
            } else if (!updatedPost) {
                console.log("404 ", err)
                return res.status(404).send({
                    success: false,
                    error: JSON.stringify(postUpdateErr)
                });
            }
            return res.status(201).send({
                success: true,
                data: updatedPost,
                message: "Comment created successfully"
            })
        })
    })
})


/* Delete a comment on a post */
/* Note, only the group superviser, post or comment owner can delete the comment*/ 
/*
    // req body
    let req_body = {
      'post_id': this.props.post_id,
      'group_id': this.props.group_id
    };
*/
commentRouter.delete("/:comment_id", authMiddleware, (req, res, next) => {
    // make sure the user is the group superviser, post creater, or comment creater
    req.authorized = 'false';
    Group.findOne({_id: req.body.group_id}, function(groupFindErr, groupFind){
        if(groupFindErr || !groupFind){
            return res.status(400).send({
                success:false,
                error: JSON.stringify(groupFindErr),
                msg:"1"
            });
        }
        else{
            // check if the user is the group supervisor
            if(req.user.user_info._id.equals(groupFind.supervisor_id)){
                // delete the commend and update the post
                req.authorized = 'true';
            }
            else{
                // check whether the user is the post/comment owner
                console.log('hello1');
                console.log(req.params);
                Comment.findById(req.params.comment_id, function(commentFindErr, commentFind){
                    if(!commentFind || commentFindErr){
                        console.log("comment not found");
                        req.authorized = 'error';
                        return res.status(400).send({
                            success:false,
                            error: "Current comment not found"
                        });
                    }
                    console.log(commentFind);
                    if(commentFind.author === req.user.user_info.username){
                        console.log("authorized as comment owner");
                        req.authorized = 'true';
                    }
                    else if(commentFind.post_owner === req.user.user_info.username){
                        console.log("authorized as post owner");
                        req.authorized = 'true';
                    }
                    else{
                        /* if the user is neither the group superviser, 
                        post creater, nor comment creater*/ 
                        console.log("not authorized.")
                        return res.status(403).send({
                            success:false,
                            error: "Sorry, you are not authorized to delete this post"
                        });
                    }
                })
            }
        }
    })
    if(req.authorized === 'true'){
        Comment.findByIdAndDelete(req.params.comment_id, (err, deleteComment) => {
            console.log("authentication check complete");
            if (err) {
                console.log("500 #1, fail to delete the comment", err);
                return res.status(500).send({
                    success: false,
                    error: JSON.stringify(err)
                });
            }
            else{
                // update the post's comment_ids
                var filter = {
                    '_id': req.body.post_id
                },
                update = {
                    $pull: {comment_ids: req.params.comment_id}
                },
                options = {
                    useFindAndModify: false
                };
                Post.findOneAndUpdate(filter, update, options, (postUpdateErr, updatedPost) => {
                    if(postUpdateErr){
                        return res.status(400).send({
                            success:false,
                            error: JSON.stringify(postUpdateErr)
                        });
                    }
                    else if(!updatedPost){
                        return res.status(404).send({
                            success:false,
                            error: "Post not existed"
                        });
                    }
                    else{
                        return res.status(201).send({
                            success: true,
                            data: updatedPost,
                            message: "Comment deleted successfully"
                        })
                    }
                })
            }
        })
    }
})
module.exports = commentRouter;