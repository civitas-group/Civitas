const express  = require('express');
const userRouter = express.Router();
var Account = require('../models/account.model');
const authMiddleware = require('../middleware/auth');
/*
  return full name, username and email of all users in user_ids list
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
      res.status(401).send({
        success:false,
        err: 'Error retrieving user information from ids.'
      });
    })
});

module.exports = userRouter;