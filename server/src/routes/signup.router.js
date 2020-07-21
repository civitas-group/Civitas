// Router endpoint to create accounts.
// TODO(jessyin): Create tests/*.js to test these functions.

const express = require('express');
const signUpRouter = express.Router();
const Account = require('../models/account.model'); // account model
// JWT Authentication
// After the user creates an account, a JWT token is signed to grant user access.
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

/* Create a regular user account */
/*
  req.body ={
    username: string
    password: string 
    email: string
    group_ids: [ids of group models],
    managed_group_ids: [ids of group models],
    full_legal_name: string
  }
*/
signUpRouter.post("/regular", (req, res, next) => {
    let newAccount = {
        username: req.body.username,
        password: req.body.password,
		    email: req.body.email,
        group_ids: req.body.group_ids,
        is_supervisor: 0,
        managed_group_ids: req.body.managed_group_ids,
        requested_groups_ids:[],
        requested_groups_files:[],
        requested_to_join_groups_ids: [],
        invited_user_ids: [],
        notifications: [{ read: false,
        content: "Welcome to Civitas! Congratulations on taking part"
        + " in a simpler communication experience for your residential area"
        + " community. Go ahead and join your administrator's group! If you"
        + " meant to create your own residential area group, please create an"
        + " administrator account instead."}],
        unread_notifications_count: 1,
        full_legal_name: req.body.full_legal_name
      };
      
      bcrypt.genSalt(10,(err,salt) => {
        if(err){
          res.status(400).send({
            success: false,
            error: err.message
          });
          return;
        }
        bcrypt.hash(newAccount.password, salt,(err, hash) => {
          if(err){
            res.status(400).send({
              success: false,
              error: err.message
            });
            return;
          }
          newAccount.password = hash;
          //newAccount.save()
          Account.create(newAccount, function(err, result){
            if(err){
              res.status(400).send({
                success: false,
                error: err.message
              });
              return;
            }
            // sign the token
            jwt.sign(
              // payload info
              { 
                username:result.username,
                email:result.email,
                is_supervisor: false
              },
              process.env.JWT_SECRET,
              // token expires 1 hour
              {expiresIn:3600000},
              // call-back
              (err,token) => {
                if(err){
                  res.status(400).send({
                    success: false,
                    error: err.message
                  });
                }
                else {
                  res.cookie('token', token, {
                    maxAge: 60 * 60 * 1000, // 1 hour
                    httpOnly: true,
                    secure: true,
                    sameSite: true,
                })
                  res.status(201).send({
                      token:token,
                      success: true,
                      data: result,
                      message: "Account created successfully"
                  });
                }
              }
            );  
         });
      });
    }) 
});

/* Create an admin user account */
/*
  req.body ={
    username: string
    password: string 
    email: string
    group_ids: [ids of group models],
    managed_group_ids: [ids of group models],
    full_legal_name: string
  }
*/
signUpRouter.post("/admin", (req, res, next) => {
  bcrypt.genSalt(10,(err,salt) => {
    if(err){
      res.status(400).send({
        success: false,
        error: err.message
      });
      return;
    }
    bcrypt.hash(req.body.password, salt,(err, hash) => {
      if(err){
        res.status(400).send({
          success: false,
          error: err.message
        });
        return;
      }
      Account.create({
        username: req.body.username,
        password: hash,
        email: req.body.email,
        group_ids: req.body.group_ids,
        is_supervisor: 1,
        managed_group_ids: req.body.managed_group_ids,
        requested_groups_ids:[],
        requested_groups_files:[],
        requested_to_join_groups_ids: [],
        invited_user_ids: [],
        notifications: [{ read: false,
        content: "Welcome to Civitas! Congratulations on taking the first"
        + " step to providing a more fluid experience for your residential"
        + " community during such difficult times. Please feel free to reach out"
        + " to civitasmain@gmail.com for any concerns or difficulties. Do note"
        + " that administrator accounts are only meant for creating and managing"
        + " your own groups - not joining any groups as a regular member."}],
        unread_notifications_count: 1,
        full_legal_name: req.body.full_legal_name
       }, function(err, result) {
        if(err){
          res.status(400).send({
            success: false,
            error: err.message
          });
          return;
        }
        jwt.sign(
          // payload info
          { 
            username:result.username,
            email:result.email,
            is_supervisor:true
          },
          process.env.JWT_SECRET,
          // token expires 1 hour
          {expiresIn:3600000},
          // call-back
          (err,token) => {
            if(err){
              res.status(400).send({
                success: false,
                error: err.message
              });
            }
            else {
              res.cookie('token', token, {
                maxAge: 60 * 60 * 1000, // 1 hour
                httpOnly: true,
                secure: true,
                sameSite: true,
              })
              res.status(201).send({
                  token:token,
                  success: true,
                  data: result,
                  message: "Account created successfully"
              });
            }
          }
        );  
      });
    });
  });
});

module.exports = signUpRouter;