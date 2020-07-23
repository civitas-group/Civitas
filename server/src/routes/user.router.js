const express  = require('express');
const userRouter = express.Router();
var Account = require('../models/account.model');
const authMiddleware = require('../middleware/auth');
var jwt_decode = require('jwt-decode');
/*
  Return full name, username and email of all users in user_ids list
  Used when only have list of user_ids and need more info
  body: {
    user_ids: [string]
  }
*/
userRouter.post('/findmultiple', authMiddleware, (req, res) => {
  let user_ids = req.body.user_ids;
  let funcs = [];
  for (let i = 0; i < user_ids.length; ++i){
    funcs.push(Account.findOne( { '_id': user_ids[i] }))
  }
  Promise.all(funcs)
    .then(results=>{
      let users = [];
      for (let i = 0; i < results.length; ++i){
        if (results[i].hasOwnProperty('full_legal_name')){
          users.push({ 
            username: results[i].username,
            email: results[i].email,
            full_legal_name: results[i].full_legal_name
          })
        } else {
          users.push({ 
            username: results[i].username,
            email: results[i].email,
            full_legal_name: 'No full_legal_name'
          })
        }
      }
      res.status(200).send({
        success:true,
        users: users
      });
    
    })
    .catch(err=>{
      console.error('Error retrieving user information from ids:',err);
      res.status(400).send({
        success:false,
        err: 'Error retrieving user information from ids.'
      });
    })
});

userRouter.get('/find_all_admins', authMiddleware, (req, res) => {
  if(!req.user.user_info.is_super_admin){
    res.status(401).send({
      success:false,
      err: 'Not super admin.'
    });
    return;
  }
  Account.find({}, function(err, users) {
    var adminsList = [];

    users.forEach(function(user) {
      if (user.is_supervisor){
        adminsList.push(user);
      }
      
    });

    res.send(adminsList);  
    return;
  });
});


module.exports = userRouter;