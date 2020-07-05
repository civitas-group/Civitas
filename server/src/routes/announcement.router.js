// Sample Post update handling

const express = require('express');
const announcementRouter = express.Router();
const Announcement = require('../models/announcement.model');
var Account = require('../models/account.model');
var Group = require('../models/group.model');
const authMiddleware = require('../middleware/auth');
var jwt_decode = require('jwt-decode');

/* Add Single Announcement */
// Input (body): title, body, group_id
announcementRouter.post("/", authMiddleware, (req, res, next) => {
  var decoded = jwt_decode(req.token);
  var criteria = {username: decoded.username}

  // Find account based on username to ensure user is supervisor
  Account.findOne(criteria, function(accountErr, user){
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
  let newAnnouncement = {
    title: req.body.title,
    body: req.body.body,
    author: decoded.username,
    created: Date.now(),
  };

  // Create announcement
  Announcement.create(newAnnouncement, function(err, result) {
    if(err){
      res.status(400).send({
        success: false,
        error: JSON.stringify(err)
      });
    }

    criteria = {_id: req.body.group_id};

   // Find group in groups collections based on group_id
    Group.findOne(criteria, function(groupFindErr, groupFind){
      if(groupFindErr || !groupFind){
        res.status(400).send({
          success:false,
          error: JSON.stringify(groupFindErr),
        });
        return;
      // Successful so far
      } else {
        fieldsToUpdate = { 
          '$push': { 'announcement_ids': result._id} 
        }
        // Update group in groups collection based on group_id to
        // push announcement_id to list of announcement_ids
        Group.findByIdAndUpdate(req.body.group_id,
          fieldsToUpdate, { useFindAndModify: false },
          function (groupUpdateErr, groupUpdateResult) {
            if(groupUpdateErr){
              res.status(400).send({
                success: false,
                error: JSON.stringify(groupUpdateErr)
                });
            } else {
              res.status(201).send({
                success: true,
                data: result,
                message: "Announcement created successfully"
              });
            }
        })
      }
    });
  });
});


/* Delete Single Announcement */
// Input (body): group_id, announcement_id
announcementRouter.delete("/", authMiddleware, (req, res, next) => {
  let group_id = req.body.group_id;
  let announcement_id = req.body.announcement_id;

  fieldsToUpdate = { 
    '$pull': { 'announcement_ids': announcement_id } 
  }

  // Find group in groups collections based on group_id to 
  // remove announcement_id from list of announcement_ids
  Group.findByIdAndUpdate(group_id,
    fieldsToUpdate, 
    { useFindAndModify: false },
    function (err, result) {
      if(err){
        res.status(400).send({
          success: false,
          error: err.message
        });
        return;
      }
      // Successful so far
      else {
        // Delete announcement from announcements collection
        Announcement.findByIdAndDelete(announcement_id, 
          function(announcementErr, announcementResult) {
          if(err){
            res.status(400).send({
              success: false,
              error: announcementErr.message
            });
            return;
          }
          // Success
          res.status(200).send({
            success: true,
            data: announcementResult,
            message: "Announcement deleted successfully"
          });
          return;
        });
      }
  });
});

module.exports = announcementRouter;
