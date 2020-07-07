// Routes for Comments

const express = require('express');
const commentRouter = express.Router();
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const authMiddleware = require('../middleware/auth');

/* Get comments for a post given a post_id */
commentRouter.get('/get-comments/:post_id', authMiddleware, (req, res) => {
    console.log("GET COMMENT REQ: ", req);
    // Find the post that contains our target comments
    Post.findById(req.params.post_id, (err, targetPost) => {
        if (err) {
            return res.status(500).send({
                success: false,
                error: JSON.stringify(err)
            });
        } else if (!targetPost) {
            return res.status(404).send({
                success: false,
                error: JSON.stringify(err)
            });
        }

        // find and return all Comments from the Comment id's that the post holds
        let comment_ids = targetPost.comment_ids;
        Comment.find({'_id': {$in: comment_ids}}, (err, targetComments) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    error: JSON.stringify(err)
                });
            } else if (!targetComments) {
                return res.status(404).send({
                    success: false,
                    error: JSON.stringify(err)
                });
            }
            return res.status(200).send({
                success: true,
                data: {
                    comments: targetComments
                }
            });
        });
    });
})

/* Make a comment on a post */
commentRouter.post('/create-comment', authMiddleware, (req, res) => {
    console.log("CREATE COMMENT REQ: ", req);
    // TODO: check that user making req has proper permissions to comment on the specificed post
    let newComment = {
        author: req.body.author,
        is_reply: req.body.is_reply,
        text: req.body.text,
        created: Date.now()
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

module.exports = commentRouter;