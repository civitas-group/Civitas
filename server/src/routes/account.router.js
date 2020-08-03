const express  = require('express');
const authMiddleware = require('../middleware/auth');
const Account = require('../models/account.model');
const Group = require('../models/group.model');
const accountRouter = express.Router();

/*
* Given an account username, deletes the account document and removes the account id reference from all groups
* that include this account.
*/
accountRouter.delete('/delete', authMiddleware, (req, res) => {
    var userId;
    Account.findOne({username: req.body.username}, (err, user) => {
        if (err || !user) {
            return res.status(400).send({
                success: false,
                error: JSON.stringify(err)
            });
        }
        userId = user._id;
    })

    // Remove account ID from all groups that the account is in.
    var groupId;

    fieldsToUpdate = {
        '$pullAll': {'user_ids': userId}
    }
    for (groupId of req.body.group_ids) {
        Group.findByIdAndUpdate({_id: groupId}, fieldsToUpdate, (err, group) => {
            if (err || !group) {
                return res.status(400).send({
                    success: false,
                    error: JSON.stringify(err)
                });
            }
        });
    }

    // Remove account Id from all groups that the account has requested to join.
    fieldsToUpdate = {
        '$pullAll': {'requested_to_join_user_ids': userId}
    }
    for (groupId of req.body.requested_to_join_groups_ids) {
        Group.findByIdAndUpdate({_id: groupId}, fieldsToUpdate, (err, group) => {
            if (err || !group) {
                return res.status(400).send({
                    success: false,
                    error: JSON.stringify(err)
                });
            }
        });
    }

    // Remove account Id from all groups that the account is invited to.
    fieldsToUpdate = {
        '$pullAll': {'invited_user_ids': userId}
    }
    for (groupId of req.body.invited_groups_ids) {
        Group.findByIdAndUpdate({_id: groupdId}, fieldsToUpdate, (err, group) => {
            if (err || !group) {
                return res.status(400).send({
                    success: false,
                    error: JSON.stringify(err)
                });
            }
        })
    }

    // Remove account Id from all groups that the account is a supervisor for.
    fieldsToUpdate = {
        '$unset': {'supervisor_id': ""}
    }
    for (groupId of req.body.managed_groups_ids) {
        Group.findByIdAndUpdate({_id: groupId}, fieldsToUpdate, (err, group) => {
            if (err || !group) {
                return res.status(400).send({
                    success: false,
                    error: JSON.stringify(err)
                });
            }
        })
    }

    // Finally delete the account.
    Account.findByIdAndDelete(userId, (err, result) => {
        if (err || !result) {
            return res.status(400).send({
                success: false,
                error: JSON.stringify(err)
            });
        }
    })

    return res.status(200).send({
        success: true
    });
});

module.exports = accountRouter;