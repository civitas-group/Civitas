exports.addGroupIDS = function(user, decoded_jwt){
  let group_ids = [];
  let managed_groups_ids = [];
  let requested_groups_ids = [];
  let invited_groups_ids = [];
  let requested_to_join_groups_ids = [];

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
  
  let full = Object.assign(decoded_jwt, {
    group_ids: group_ids,
    managed_groups_ids: managed_groups_ids,
    requested_groups_ids: requested_groups_ids,
    invited_groups_ids: invited_groups_ids,
    requested_to_join_groups_ids: requested_to_join_groups_ids
  })
  return full;
}
