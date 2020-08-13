var Account = require('../models/account.model');
var Group = require('../models/group.model');

async function getGroupNames(group_ids){
  let funcs = [];
  for (let i = 0; i < group_ids.length; ++i){
    funcs.push(Group.findOne( { '_id': group_ids[i] }))
  }
  return new Promise((resolve, reject) => {
    Promise.all(funcs)
    .then(results=>{
      let group_names = [];
      for (let i = 0; i < results.length; ++i){
        group_names.push(results[i].group_name)
      }

      resolve(group_names)
    
    })
    .catch(err=>{
      reject('error')
    })
  })
}

async function addUserInfo(user, decoded_jwt){
  let group_ids = [];
  let managed_groups_ids = [];
  let requested_groups_ids = [];
  let invited_groups_ids = [];
  let requested_to_join_groups_ids = [];
  let notifications = [];
  let unread_notifications_count = 0;
  let is_super_admin = false;
  let total_points = 0;
  let managed_groups_names = [];
  let group_names = [];

  if ('group_ids' in user){ 
    group_ids = user.group_ids; 
  }
  if ('managed_groups_ids' in user){
    managed_groups_ids = user.managed_groups_ids; 
  }
  if ('requested_groups_ids' in user){
    requested_groups_ids = user.requested_groups_ids; 
  }
  if ('invited_groups_ids' in user){
    invited_groups_ids = user.invited_groups_ids; 
  } 
  if ('requested_to_join_groups_ids' in user){
    requested_to_join_groups_ids = user.requested_to_join_groups_ids; 
  } 
  if ('notifications' in user){
    notifications = user.notifications; 
  } 
  if ('unread_notifications_count' in user){
    unread_notifications_count = user.unread_notifications_count;
  }
  if ('is_super_admin' in user){
    is_super_admin = user.is_super_admin;
  }
  if ('total_points' in user){
    total_points = user.total_points;
  }

  // Convert group IDs to names
  managed_groups_names = await getGroupNames(user.managed_groups_ids)
  group_names =  await getGroupNames(user.group_ids)

  let full = Object.assign(decoded_jwt, {
    group_ids: group_ids,
    managed_groups_ids: managed_groups_ids,
    requested_groups_ids: requested_groups_ids,
    invited_groups_ids: invited_groups_ids,
    group_names: group_names,
    managed_groups_names: managed_groups_names,
    requested_to_join_groups_ids: requested_to_join_groups_ids,
    notifications: notifications,
    unread_notifications_count: unread_notifications_count,
    is_super_admin: is_super_admin,
    total_points: total_points
  })
  return full;
}

// NOTIFICATIONS

// Helper function for pushing notification to user_id
// Content is notification content, default to unread
function pushNotification (user_id, content){
  let fieldsToUpdate = {
    'notifications': {
      'read': false,
      'content': content,
    }
  }

  /*
  // for dev only
  if (user_id !== 'string'){
    return new Promise((resolve, reject) => {
      Account.findOneAndUpdate(user_id,
        { $push: fieldsToUpdate,
          $inc: { 'unread_notifications_count': 1 }
        },
        { useFindAndModify: false, new: true },  
        function (accountErr, accountResult) {
          if(accountErr){
            reject(accountErr)
          } else {
            resolve(accountResult)
          }
      })
    })
  }*/

  // regular
  return new Promise((resolve, reject) => {
    Account.findByIdAndUpdate(user_id,
      { $push: fieldsToUpdate,
        $inc: { 'unread_notifications_count': 1 } 
      },
      { useFindAndModify: false, new: true },  
      function (accountErr, accountResult) {
        if(accountErr){
          reject(accountErr)
        } else {
          resolve(accountResult)
        }
    })
  })

}

// Use pushNotification to send notifications to all supervisors of group
// supervisor + all cosupervisors
// Group is Group object based on Mongoose schema,
//    uses supervisor_id and cosupervisor_ids
// Content is notification content    
async function pushNotificationToSupervisors (Group, content){
  await pushNotification(Group.supervisor_id, content)
  for (let i = 0; i < Group.cosupervisor_ids.length; ++i){
    await pushNotification(Group.cosupervisor_ids[i], content)
  }
}

exports.addUserInfo = addUserInfo;
exports.pushNotification = pushNotification;
exports.pushNotificationToSupervisors = pushNotificationToSupervisors;