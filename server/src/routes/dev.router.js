const express  = require('express');
const devRouter = express.Router();
// After the user logins, a JWT token is signed to grant user access.
const jwt = require('jsonwebtoken');
var jwt_decode = require('jwt-decode');

devRouter.post('/authorize', verifyToken, (req, res) => {  
    jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
      if(err) {
        res.sendStatus(403);
      } else {

        let decoded = jwt_decode(req.token);
        let full = "";
        if (decoded.username === "a9"){
          full = Object.assign(decoded, {
            group_ids: ["5ee449a308eedc0f7b42366e"]
          })
        } else if (decoded.username === "a11"){
          full = Object.assign(decoded, {
            group_ids: ["5ee449a308eedc0f7b42366e"]
          })
        } else if (decoded.username === "a10"){
          full = Object.assign(decoded, {
            group_ids: [],
            managed_groups_ids: ["5ee449a308eedc0f7b42366e"]
          })
        }

        if (full != "" ) { res.json(full); }
        else { res.json(decoded); }
      }
    });
});

devRouter.post('/group/:group_id', verifyToken, (req, res) => {  
  jwt.verify(req.token, process.env.JWT_SECRET, (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {

      let decoded = jwt_decode(req.token);
      let full = Object.assign(decoded, {
        group_ids: ["5ee449a308eedc0f7b42366e"],
        group_name: "test_group1",
        posts: [{"title": "This is the first post title",
                "body": "This is the first post body",
                "author": "Author1",
                "likes": 23},
                {"title": "2nd post title",
                "body": "2nd post body",
                "author": "Author2",
                "likes": 12},
                {"title": "3rd post title",
                "body": "3rd post body",
                "author": "Author3",
                "likes": 19}]
      })
      res.json(full);
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

module.exports = devRouter;