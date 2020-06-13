const express = require('express');
const authMiddleware = require('../middleware/auth');

var Group = require('../models/group.model');
const groupRouter = express.Router();

/* Create a new group */
groupRouter.post("/", authMiddleware, (req, res) => {
    let newGroup = {
        group_name: req.body.group_name,
        supervisor_id: req.user.user_info._id,
        is_private: true,
        is_valid: false
    };
    Group.create(newGroup, function(err, result) {
        if(err){
          res.status(400).send({
            success: false,
            error: err.message
          });
        } else {
            res.status(201).send({
            success: true,
            created_group: result
            });
        }
    });
});

module.exports = groupRouter;
