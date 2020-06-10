const express  = require('express');
const authRouter = express.Router();
var Account = require('../models/account.model');
// After the user logins, a JWT token is signed to grant user access.
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

authRouter.post('/', verifyToken, (req, res) => {  
    jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
      if(err) {
        res.sendStatus(403);
      } else {
        res.json({
          validated: 1,
        });
      }
    });
  });
  
  
  function verifyToken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if(typeof bearerHeader !== 'undefined') {
      // Split at the space
      const bearer = bearerHeader.split(' ');
      // Get token from array
      const bearerToken = bearer[1];
      // Set the token
      req.token = bearerToken;
      // Next middleware
      next();
    } else {
      // Forbidden
      res.sendStatus(403);
    }
  
  }
  
  
authRouter.post('/admin_login', (req,res) =>{
    // check '@' string
    const username_email = req.body.user_or_email;    ;
    const password = req.body.password;
    //const email =  req.body.email;
    if(!username_email){
        res.status(400).send({
            success:false,
            msg:"Please enter username or email."
        });
        return;
    }
    if(!password){
        res.status(400).send({
            success:false,
            msg:"Please enter your password."
        });
        return;
    }
    // decide whether the user inputs an username or email.
    var criteria = (username_email.indexOf('@') === -1) ? {username: username_email} : {email: username_email};
    // check the credentials
    Account.findOne(criteria,
        function(err, user){
        if(err){
            res.status(400).send({
                success:false,
                error: err.message,
                msg:'Mongoose error'
            });
            return;
        }
        if(!user){
            res.status(400).send({
                success:false,
                msg:"Account does not exists."
            });
            return;
        }
        else{
            // validate the password
            bcrypt.compare(password,user.password,
                function(err,isMatch){
                    if(err){
                        res.status(400).send({
                            success:false,
                            error: err.message,
                            msg:'bcrypt error'
                        });
                        return;
                    }
                    // wrong psw
                    if(!isMatch){
                        res.status(400).send({
                            success:false,
                            msg:"Invalid password"
                        });
                        return;
                    }
                    // if psw matches, send new JWT token.
                    jwt.sign(
                        // payload info
                        { 
                          username:user.username,
                          email:user.email,
                          is_supervisor:user.is_supervisor
                        },
                        process.env.JWT_SECRET,
                        // token expires 1 hour
                        {expiresIn:3600000},
                        // call-back
                        (err,token) => {
                          if(err){
                            res.status(400).send({
                              success: false,
                              //error: err.message
                              msg:"Error generating token"
                            });
                          }
                          else {
                            res.status(201).send({
                                token:token,
                                success: true,
                                data: user,
                                message: "Login successfully"
                            });
                          }
                        }
                    );  
                })
        }
    });
        //.then((err,user)=>{
        //exec(function(err, user)
});


authRouter.post('/regular_login', (req,res) =>{
    res.json({message:'regular_login'});
});


authRouter.post('/admin_logout', (req,res) =>{
    res.json({message:'logout'});
});

authRouter.post('/regular_logout', (req,res) =>{
    res.json({message:'logout'});
});

module.exports = authRouter;