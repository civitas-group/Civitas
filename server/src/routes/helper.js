exports.addGroupIDS = function(user, decoded_jwt){
  let group_ids = [];
  let managed_groups_ids = [];
  if ('group_ids' in user){ 
    group_ids = user.group_ids; 
  }
  if ('managed_groups_ids' in user){
    managed_groups_ids = user.managed_groups_ids; 
  }
  let full = Object.assign(decoded_jwt, {
    group_ids: group_ids,
    managed_groups_ids: managed_groups_ids
  })
  return full;
}
