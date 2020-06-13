const jwt = require('jsonwebtoken');
var Account = require('../models/account.model');

function authMiddleware(req,res,next){
    // Check if token is unauthorized
    //return res.status(200).json({headers:req.headers});
    if(!req.headers['authorization']) {
      res.status(401).json({msg:"No token is available, authentication failed"});
    }
    else {
      const bearerHeader = req.headers['authorization'];
      // Split at the space
      const bearer = bearerHeader.split(' ');
      // Get token from array
      const bearerToken = bearer[1];
      //return res.status(200).json({bearerHeader:bearerHeader, token: bearerToken});
      // Set the token
      req.token = bearerToken;
      // verify the token and add the payload info into req.
      jwt.verify(bearerToken, process.env.JWT_SECRET, (err, authData) => {
        if(err) {
          // unauthorized
          res.status(401).json({msg:"Token is invalid, authentication failed"});
        } else {
          // if authorized, find the user info and pass into the res
          Account.findOne({username:authData.username}).select('-password').then(user_info =>{
            //res.json({payload:authData, user_info: user_info});
            req.user = {payload:authData, user_info: user_info};
            next();
          });
        }
      });
    }
};
module.exports = authMiddleware;
