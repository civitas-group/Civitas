const express  = require('express');
const authRouter = express.Router();
var Account = require('../models/account.model');
// After the user logins, a JWT token is signed to grant user access.
const jwt = require('jsonwebtoken');
var jwt_decode = require('jwt-decode');
const bcrypt = require('bcryptjs');

authRouter.post('/', verifyToken, (req, res) => {  
    jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
      if(err) {
        res.sendStatus(403);
      } else {

        var decoded = jwt_decode(req.token);
        res.json(decoded);
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
  
  
authRouter.post('/login', (req,res) =>{
    // check '@' string
    const email_username = req.body.email_username;
    const password = req.body.password;
    if(!email_username){
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
    var criteria = (email_username.indexOf('@') === -1) ? {username: email_username} : {email: email_username};
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
                            res.cookie('token', token, {
                              maxAge: 60 * 60 * 1000, // 1 hour
                              httpOnly: true,
                              secure: true,
                              sameSite: true,
                            })
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
});

authRouter.post('/logout', (req,res) =>{
    res.json({message:'logout'});
});

module.exports = authRouter;