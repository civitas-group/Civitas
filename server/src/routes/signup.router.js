// Router endpoint to create accounts.
// TODO(jessyin): Create tests/*.js to test these functions.

const express = require('express');
const signUpRouter = express.Router();
const Account = require('../models/account.model'); // account model

/* Create a regular user account */
signUpRouter.post("/regular", (req, res, next) => {
    let newAccount = {
        username: req.body.username,
        password: req.body.password,
		email: req.body.email,
        group_ids: req.body.group_ids,
        is_supervisor: 0,
        managed_group_ids: req.body.managed_group_ids
      }

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
});

/* Create an admin user account */
signUpRouter.post("/admin", (req, res, next) => {
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
});

module.exports = signUpRouter;