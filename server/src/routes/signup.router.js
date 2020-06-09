// Router endpoint to create accounts.
// TODO(jessyin): Create tests/*.js to test these functions.

const express = require('express');
const signUpRouter = express.Router();
const Account = require('../models/account.model'); // account model
// JWT Authentication
// After the user creates an account, a JWT token is signed to grant user access.
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

/* Create a regular user account */
signUpRouter.post("/regular", (req, res, next) => {
    let newAccount = {
        username: req.body.username,
        password: req.body.password,
		    email: req.body.email,
        group_ids: req.body.group_ids,
        is_supervisor: 0,
        managed_group_ids: req.body.managed_group_ids
      };
      
      bcrypt.genSalt(10,(err,salt) => {
        if(err) throw err;
        bcrypt.hash(newAccount.password, salt,(err, hash) => {
          if(err) throw err;
          newAccount.password = hash;
          //newAccount.save()
          Account.create(newAccount, function(err, result){
            if(err) throw err;
            // sign the token
            jwt.sign(
              // payload info
              {username:result.id,
                email:result.email
              },
              process.env.JWT_SECRET,
              // token expires 1 hour
              {expiresIn:7200},
              // call-back
              (err,token) => {
                if(err){
                  res.status(400).send({
                    success: false,
                    error: err.message
                  });
                }
                else {
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
    /*
    Account.create(newAccount, function(err, result) {
    if(err){
        res.status(400).send({
          success: false,
          error: err.message
        });
    } else {
        res.status(201).send({
            success: true,
            data: result,
            message: "Account created successfully"
        });
    }
    });
    */
});

/* Create an admin user account */
signUpRouter.post("/admin", (req, res, next) => {
  bcrypt.genSalt(10,(err,salt) => {
    if(err) throw err;
    bcrypt.hash(req.body.password, salt,(err, hash) => {
      if(err) throw err;
      Account.create({
        username: req.body.username,
        password: hash,
        email: req.body.email,
        group_ids: req.body.group_ids,
        is_supervisor: 1,
        managed_group_ids: req.body.managed_group_ids
       }, function(err, result) {
        jwt.sign(
          // payload info
          {username:result.id,
            email:result.email
          },
          process.env.JWT_SECRET,
          // token expires 1 hour
          {expiresIn:7200},
          // call-back
          (err,token) => {
            if(err){
              res.status(400).send({
                success: false,
                error: err.message
              });
            }
            else {
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
  /*
   Account.create({
    username: req.body.username,
    password: req.body.password,
	  email: req.body.email,
    group_ids: req.body.group_ids,
    is_supervisor: 1,
    managed_group_ids: req.body.managed_group_ids
   }, function(err, result) {
    if(err){
        res.status(400).send({
          success: false,
          error: err.message
        });
    } else {
        res.status(201).send({
            success: true,
            data: result,
            message: "Account created successfully"
        });
    } 
  });
  */
});

module.exports = signUpRouter;