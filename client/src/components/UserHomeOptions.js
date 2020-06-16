import React from 'react';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom'

function CreateGroupLink(props){
  return(
    <Link to="/creategroup">
      <Button>
        Create {props.additional} Group as Admin
      </Button>
    </Link>
  )
}
function JoinGroupLink(){
  return(
    <Link to="/joingroup">
      <Button>Join Group</Button>
    </Link>
  )
}

function GroupLinks(props){
  let endpoint = "";
  let group_links = []
  for (let i = 0; i < props.ids.length; ++i){
    endpoint = "/group/" + props.ids[i];
    group_links.push(
    <div>
      <Link to={endpoint}>
        <Button outline color="primary">{props.ids[i]}</Button>
      </Link>
    </div>
    )
  }
  return (
  <div>
    <h3>Your {props.admin ? "administered" : "" } groups:</h3>
    {group_links}
  </div>)
}

function UserHomeOptions(props) {
    if (props.info.is_supervisor) {    
      console.log("INFO:",props.info)
      if ('managed_groups_ids' in props.info){
        if (props.info['managed_groups_ids'].length === 0){
          return (<CreateGroupLink />)           
        }
        else {
          return(
            <div>
            <GroupLinks admin={true}
              ids={props.info['managed_groups_ids']} />
            <CreateGroupLink additional="another"/>
            </div>
          )
        }
      }
      return (<CreateGroupLink />)  
    } 
    else {
      if ('group_ids' in props.info){
        if (props.info['group_ids'].length === 0){
          return (<JoinGroupLink />)       
        }
        else {
          return (<GroupLinks admin={false} 
            ids={props.info['group_ids']} />)
        }
      }
      return (<JoinGroupLink />)  
    }
  }

  export default UserHomeOptions;