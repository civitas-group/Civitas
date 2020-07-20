const express  = require('express');
const notificationRouter = express.Router();
var Account = require('../models/account.model');
const authMiddleware = require('../middleware/auth');
const helper = require('./helper.js')

/*
  body: {
    user_id: ObjectId
    content: string
  }
*/
notificationRouter.post('/push', authMiddleware, async (req, res) => {
  /*let findField = req.user.user_info._id;
  
  // for dev only
  if (req.body.hasOwnProperty('username_dev')){
    findField = { username: req.body.username_dev }
  }
  console.log(findField)*/

  helper.pushNotification((String(req.user.user_info._id)), req.body.content)
    .then(()=>{
      res.status(201).send({
        success: true,
        msg: "Pushed notification"
      });
      return;
    })
    .catch(error=>{
      res.status(400).send({
        success: false,
        error: error
      });
      return;
    })
});

/* 
  /mark?index=int&read=boolean
  index: int, required (index of notification in user's notification list)
  read: boolean, required (true if mark as read, else false)
}*/
notificationRouter.patch('/mark', authMiddleware, async (req, res) => {
  if (!req.query.hasOwnProperty('index') || !req.query.hasOwnProperty('read')) {
    return res.status(400).send({
      success: false,
      error: 'Invalid query'
    });
  } else {
    if (req.query.read !== 'true' && req.query.read !== 'false'){
      return res.status(400).send({
        success: false,
        error: 'Invalid query'
      });
    }
  }

  let field = 'notifications.' + req.query.index + '.read'
  let set = {}
  set[field] = req.query.read === 'true'? true : false; 
  let increment = req.query.read === 'true'? -1 : 1;

  Account.findByIdAndUpdate(req.user.user_info._id,
    { '$set': set, 
      '$inc': { 'unread_notifications_count': increment },
    },
    { useFindAndModify: false },  
    function (accountErr, accountResult) {
      if(accountErr){
        res.status(400).send({
          success: false,
          error: accountErr
        });
        return;
      } else {
        res.status(201).send({
          success: true,
          msg: "Marked notification as read"
        });
        return;
      }
  })
});

notificationRouter.post('/push_to_supervisors', authMiddleware, async (req, res) => {
  /*let findField = req.user.user_info._id;
  
  // for dev only
  if (req.body.hasOwnProperty('username_dev')){
    findField = { username: req.body.username_dev }
  }
  console.log(findField)*/
  let Group = { 
    supervisor_id: req.body.supervisor_id,
    cosupervisor_ids:  req.body.cosupervisor_ids 
  }
  console.log(Group, req.body.content)
  helper.pushNotificationToSupervisors(Group, req.body.content)
    .then(()=>{
      res.status(201).send({
        success: true,
        msg: "Pushed notification to supervisors"
      });
      return;
    })
    .catch(error=>{
      res.status(400).send({
        success: false,
        error: error
      });
      return;
    })
});

module.exports = notificationRouter;