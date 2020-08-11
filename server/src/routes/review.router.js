const express = require('express');
const reviewRouter = express.Router();
const Post = require('../models/post.model'); // post model
const Group = require('../models/group.model');
var Account = require('../models/account.model');
const Review = require('../models/review.model');
const helper = require('./helper.js');
var jwt_decode = require('jwt-decode');
const authMiddleware = require('../middleware/auth');

async function add_points(req, res, user_id, rating){
    return new Promise((resolve, reject) => {
        Account.findOne({_id:user_id}, function(userErr, user){
            if(userErr || !user){
                reject("Finding the account failed")
            }
            else{
                let new_rating = user.total_points + rating
                let fields_to_update = {'$set': {"total_points" : new_rating}}
                Account.findByIdAndUpdate(user_id,fields_to_update, {useFindAndModify: false },  
                function (accountUpdateErr, new_account) {
                    if(accountUpdateErr){
                        reject("Upating the account failed")
                    } else {
                        resolve(true)
                    }
                })
            }
        })
    })
}

/*
    This API enables group admins to set a review's status into 'approved'.
    The resolver's total_points in their account will be updated.
    Then notification of points updates will be sent to resolvers.

    req.body:{
        review_id: mongoose.ObjectId of "review"
    }
*/
reviewRouter.patch("/approve",authMiddleware,(req,res,next) => {
    if(!req.body.review_id){
        res.status(400).send({
            success:false,
            error: "Please provide the id of review object "
          });
        return;
    }
    var review_id = req.body.review_id;
    var criteria ={_id:review_id};
    Review.findOne(criteria, function(reviewErr, review){
        if(reviewErr || !review){
            res.status(400).send({
                success:false,
                error: 'Invalid review_id',
            });
            return;
        }
        let group_id = review.group_id
        let group_updates = {'$pull': {"pending_reviews" : review._id},
        '$push': { 'completed_reviews': review._id} 
        };
        Group.findByIdAndUpdate(group_id, group_updates, { useFindAndModify: false },
        function (groupUpdateErr, groupUpdateResult) {
            if(groupUpdateErr || !groupUpdateResult){
                res.status(400).send({
                    success:false,
                    error: 'Updating group failed',
                });
                return;
            } 
            else{
                let review_updates = {'$set': {"verification_status" : 'accepted'}};
                Review.findByIdAndUpdate(review_id, review_updates, { useFindAndModify: false },
                async function (review_update_err, new_review) {
                    if(review_update_err || !new_review){
                        res.status(400).send({
                            success:false,
                            error: 'Updating review failed',
                        });
                        return;
                    }
                    else{
                        // update each resolver's grades
                        let resolvers_ids = new_review.resolvers_ids
                        let resolvers_points = new_review.ratings
                        let account_results = {
                            'succeeded': [],
                            'failed': []
                        };
                        for (i = 0; i < resolvers_ids.length; i++) {
                            let user_id = resolvers_ids[i];
                            let rating = resolvers_points[i];
                            let update_res = await add_points(req, res, user_id, rating);
                            if (typeof update_res === 'string'){
                                account_results['failed'].push(user_id)
                            }
                            else{
                                account_results['succeeded'].push(user_id)
                            }
                        }
                        if(account_results['succeeded'].length ===0){
                            res.status(400).send({
                                success:false,
                                error: 'Updating account failed',
                            });
                            return;
                        }
                        // send the notifications
                        for (j = 0; j < resolvers_ids.length; j++){
                            if(account_results['succeeded'].indexOf(resolvers_ids[j]) !== -1){
                                let content = 'A new point of ' + resolvers_points[j] 
                                + ' has been added to your account';
                                await helper.pushNotification(resolvers_ids[j], content);
                            }
                        }
                        res.status(200).send({
                            success:true,
                            msg: 'Approving review succeeded',
                            succeeded_account:account_results['succeeded'],
                            failed_account: account_results['failed']
                        });
                        return;
                    }
                })        
            }
        })
    })
})

/*
    This API enables group admins to set a review's status into 'rejected'.
    Notification of admin's decision will be sent to resolvers.
    req.body:{
        review_id: mongoose.ObjectId of "review"
    }
*/
reviewRouter.patch("/reject",authMiddleware,(req,res,next) => {
    if(!req.body.review_id){
        res.status(400).send({
            success:false,
            error: "Please provide the id of review object "
          });
        return;
    }
    var review_id = req.body.review_id;
    var criteria ={_id:review_id};
    Review.findOne(criteria, function(reviewErr, review){
        if(reviewErr || !review){
            res.status(400).send({
                success:false,
                error: 'Invalid review_id',
            });
            return;
        }
        let group_id = review.group_id
        let group_updates = {'$pull': {"pending_reviews" : review._id},
        '$push': { 'completed_reviews': review._id} 
        };
        Group.findByIdAndUpdate(group_id, group_updates, { useFindAndModify: false },
        function (groupUpdateErr, groupUpdateResult) {
            if(groupUpdateErr || !groupUpdateResult){
                res.status(400).send({
                    success:false,
                    error: 'Updating group failed',
                });
                return;
            } 
            else{
                let review_updates = {'$set': {"verification_status" : 'rejected'}};
                Review.findByIdAndUpdate(review_id, review_updates, { useFindAndModify: false },
                async function (review_update_err, new_review) {
                    if(review_update_err || !new_review){
                        res.status(400).send({
                            success:false,
                            error: 'Updating review failed',
                        });
                        return;
                    }
                    else{
                        let resolvers_points = new_review.ratings
                        let resolvers_ids = new_review.resolvers_ids
                        var decoded = jwt_decode(req.token);
                        // send the notifications
                        for (j = 0; j < resolvers_ids.length; j++){
                            let content = 'A point addition of ' + resolvers_points[j] 
                            + ' has been rejected by the group admin ' + decoded.username;
                            await helper.pushNotification(resolvers_ids[j], content);
                        }
                        res.status(200).send({
                            success:true,
                            msg: 'Rejecting review succeeded'
                        });
                        return;
                    }
                })        
            }
        })
    })
})

module.exports = reviewRouter;