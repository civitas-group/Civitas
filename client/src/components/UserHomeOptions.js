import React from 'react';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom'

function UserHomeOptions(props) {
    if (props.info.is_supervisor) {    
      if ('managed_groups_ids' in props.info){
        if (props.info['managed_groups_ids'].length === 0){
          return (<Link to="/creategroup">
                    <Button>Create Group as Admin</Button>
                  </Link>)           
        }
        else {
          let endpoint = "/group/" + props.info['managed_groups_ids'][0];
          return (
          <div>
            <h1>Your administered groups:</h1>
            <Link to={endpoint}>
              <Button>{props.info['managed_groups_ids'][0]}</Button>
            </Link>
          </div>)
        }
      }
      return (<Link to="/creategroup">
                <Button>Create Groaup as Admin</Button>
              </Link>)  
    } 
    else {
      if ('group_ids' in props.info){
        if (props.info['group_ids'].length === 0){
          return (<Link to="/joingroup">
                    <Button>Join Group</Button>
                  </Link>)          
        }
        else {
          let endpoint = "/group/" + props.info['group_ids'][0];
          return (
          <div>
            <h1>Your groups:</h1>
              <Link to={endpoint}>
                <Button>{props.info['group_ids'][0]}</Button>
              </Link>
          </div>)
        }
      }
      return (<Link to="/joingroup">
                <Button>Join Group</Button>
              </Link>)  
    }
  }

  export default UserHomeOptions;