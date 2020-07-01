import React, { useState } from 'react';
import { Button, Alert, Input, UncontrolledTooltip } from 'reactstrap';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom'
import authorizeUser from '../Auth'

function CreateGroupLink(props){
  return(
    <Link to="/creategroup">
      <Button>
        Create {props.additional} Group as Admin
      </Button>
    </Link>
  )
}
const JoinGroupLink = (props) => {
  const [joinGroupID, setJoinGroup] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [error, setError] = useState(false);
  const [redirectToGroup, setRedirect] = useState(false);
  const [redirectEndpoint, setRedirectEndpoint] = useState("/home");

  let defaultErrMsg = "An error has occurred. The group could not be found.";
  const handleChange = async (event) => {
    const { target } = event;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setJoinGroup(value);
  }
  const join = () => {
    setError(false);
    setErrMsg("");
    console.log('JOIN',joinGroupID)
    let token = props.cookies.get('token');
    console.log(token)

    let apiendpoint = "/group/join/" + joinGroupID
    console.log(joinGroupID, apiendpoint)
    authorizeUser(token, apiendpoint, {}, 'patch')
      .then(result => {
        console.log("result join:",result)
        if (result){
          console.log(result)
          setError(true)
          setRedirectEndpoint("/group/" + joinGroupID)
          setRedirect(true)          
        }
        else {
          setError(true);
          setErrMsg("An error has occurred. Please try again.");
        }
      })
      .catch(error => {
        console.log(error)
        try{
          if (error.response['data']['error'].includes("General error")){
            setErrMsg("Error: no group found.")
          }
          else {
            setErrMsg(error.response['data']['error'])
          }
        }
        catch{
          setErrMsg("Error: no group found.") 
        }
        setError(true);
      })
  }
  if (redirectToGroup){
    return (<Redirect to={redirectEndpoint} />);
  }
  else {
    return(
      <div>
      <span><Alert color="danger" isOpen={error}> 
        {errMsg !== "" ? errMsg : defaultErrMsg}</Alert></span>
      <Button color="link"size="sm">
      <Input bsSize="sm" placeholder="Group ID" 
        onChange={(e) => {handleChange(e)}}/></Button>

      <Button id="JoinToolTip" size="sm" 
        onClick={()=> join()}>Join {props.additional} Group</Button>
      
      <UncontrolledTooltip placement="right" target="JoinToolTip">
          Enter the Group ID given by the admin of the group.
      </UncontrolledTooltip>
      </div>
    )
  }

}

const GroupLinks = (props) =>  {

  const [inviteUsername, setInvite] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [error, setError] = useState(false);

  let defaultErrMsg = "An error has occurred. The user could not be found.";
  const handleChange = async (event) => {
    const { target } = event;
    const value = target.type === "checkbox" ? target.checked : target.value;
    setInvite(value);
  }
  const invite = (group_id) => {
    setError(false);
    setErrMsg("");
    console.log('INVITE',inviteUsername)
    let token = props.cookies.get('token');
    console.log(token)
    let req_body = {"email_username": inviteUsername}
    let apiendpoint = "/authorize/getid"
    authorizeUser(token, apiendpoint, req_body)
      .then(result => {
        console.log("result invite:",result)
        if (result){
          console.log(result)

          apiendpoint = '/group/invite/' + group_id;
          req_body={"user_ids": [result.data.user_id]}
          authorizeUser(token, apiendpoint, req_body, 'patch')
            .then(result => {
              console.log("result invite:",result)
              if (result){
                console.log(result)
                setErrMsg("Invited " + inviteUsername + "!")
                setError(true)
                //setRedirect(true)          
              }
              else {
                setError(true);
                setErrMsg("An error has occurred. Please try again.");
              }
            })
            .catch(error => {
              if (typeof error.response.data === "string"){
                if (error.response.data.includes('must be a single String of 12 bytes')){
                  setErrMsg("Invalid user entered.")
                }
                else { setErrMsg("An unknown error has occurred.") }
              }
              else { setErrMsg(error.response.data.error) }
              setError(true);
            })
        }
        else {
          setError(true);
          setErrMsg("An error has occurred. Please try again.");
        }
      })
      .catch(error => {
        setErrMsg("No user found.")
        setError(true);
      })
  }

  let endpoint = "";
  let group_links = []
  for (let i = 0; i < props.ids.length; ++i){
    endpoint = "/groups/" + props.ids[i];
    group_links.push(
    <div key={i}>
      <Link to={endpoint}>
        <Button outline color="primary">{props.ids[i]}</Button>
      </Link>

      {props.admin ? <Button color="link"size="sm">
         <Input bsSize="sm" placeholder="Username or Email" 
        onChange={(e) => {handleChange(e)}}/></Button> : null}
      {props.admin ? 
      <Button size="sm" 
        onClick={()=> invite(props.ids[i])}>Invite User</Button> : null}

    </div>
    )
  }
  return (
  <div>
    <h3>Your {props.admin ? "administered" : "" } groups:</h3>
    <span><Alert  color={errMsg.includes("Invited") ? "success" : "danger"} isOpen={error}>
      {errMsg !== "" ? errMsg : defaultErrMsg}</Alert></span>
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
            <GroupLinks admin={true} cookies={props.cookies}
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
          console.log('1')
          return (<JoinGroupLink cookies={props.cookies}/>)       
        }
        else {
          console.log('2')
          return (
          <div>
            <GroupLinks admin={false} 
            ids={props.info['group_ids']} />
            <JoinGroupLink additional="another" cookies={props.cookies}/>
          </div>)
        }
      }
      console.log('3')
      return (<JoinGroupLink cookies={props.cookies}/>)  
    }
  }

  export default UserHomeOptions;