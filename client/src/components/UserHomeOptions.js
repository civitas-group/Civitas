import React, { useState } from 'react';
import { Button, ButtonGroup, Alert, Input, UncontrolledTooltip, 
  Row, Col, Collapse } from 'reactstrap';
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom'
import authorizeUser from '../Auth'

function CreateGroupLink(props){
  return(
    <div>
    <Link to="/creategroup">
      <Button color="primary">
        Create {props.additional} Group as Admin
      </Button>
    </Link>
    </div>
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
          window.location.reload(false); 
          //setRedirect(true)
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
            setErrMsg("No group found. " +
              "Are you sure you are entering the Group ID and not the name?")
          }
          else {
            setErrMsg(error.response['data']['error'])
          }
        }
        catch{
          setErrMsg("No group found. " +
          "Are you sure you are entering the Group ID and not the name?") 
        }
        setError(true);
      })
  }

  return(
    <div>
    <span style={{display:'flex', justifyContent:'center'}} >
      <Alert style={{fontSize:'12px', maxWidth:'30em'}} 
        color="danger" isOpen={error}> 
      {errMsg !== "" ? errMsg : defaultErrMsg}</Alert>
    </span>
    <Button color="link"size="sm">
    <Input bsSize="sm" placeholder="Group ID" 
      onChange={(e) => {handleChange(e)}}/></Button>

    <Button id="JoinToolTip" size="sm" 
      onClick={()=> join()}>Join {props.additional} Group</Button>
    
    <UncontrolledTooltip placement="right" target="JoinToolTip">
        Enter the Group ID (not name) given by the admin of the group.
    </UncontrolledTooltip>
    </div>
  )
}

const GroupLink = (props) =>  {
  const buttonSize = props.isMobile ? 'sm' : 'md';
  const [inviteUsername, setInvite] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [error, setError] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

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

  return(
    <div style={{paddingTop:'0.1em', paddingBottom:'0.1em'}}>
      <span style={{display:'flex', justifyContent:'center'}} >
        <Alert style={{fontSize:'12px', maxWidth:'30em'}} isOpen={error}
          color={errMsg.includes("Invited") ? "success" : "danger"}>
        {errMsg !== "" ? errMsg : defaultErrMsg}</Alert>
      </span>

      <Row >
      <Col style={{display:'flex', 
        justifyContent: props.admin ? 'right':'center', 
        padding:'0.1em'}}>
      <Link to={"/groups/" + props.id}>
        <Button outline color="primary" size={buttonSize}>{props.name}</Button>
      </Link> 
      </Col>
      
      {props.admin ?
      <Col style={{display:'flex', justifyContent:'left', padding:'0.1em'}}> 
      <Link to={"/groups/" + props.id + "/console"}>
        <Button outline color="primary" size={buttonSize}>
          {props.isMobile ? 'Console' : 'Admin Console'}</Button>
      </Link>

      <Button size="sm" color="link"
        onClick={()=> setShowInvite(!showInvite)}>
          {showInvite ? 'Cancel' : 
            props.isMobile ? 'Invite' : 'Invite User'}
      </Button> 
      </Col> : null}
      </Row>

      <Collapse isOpen={props.admin && showInvite}>
        <Col style={{display:'flex', justifyContent:'center'}}>
          <Row>
          <Input bsSize="sm" placeholder="Username or Email" 
            style={{width:'13em'}}
          onChange={(e) => {handleChange(e)}}/>
          <ButtonGroup>

          <Button size="sm" color="primary" 
          onClick={()=> invite(props.id)}>Invite</Button> 

          </ButtonGroup>
          </Row>
        </Col>
      </Collapse>
    </div>
    )


}

const GroupLinks = (props) =>  {

  return (
  <div>
    <h5>Your {props.admin ? "administered" : "" } groups:</h5>
    
    { Object.keys(props.ids).map(function(key) {
        return (
          <GroupLink isMobile={props.isMobile} 
            key={key} admin={props.admin}
            id={props.ids[key]} name={props.names[key]}
            cookies={props.cookies}
          />
        )})}
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
            isMobile={props.isMobile}
            ids={props.info['managed_groups_ids']}
            names={props.info['managed_groups_names']} />
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
          <GroupLinks admin={false} isMobile={props.isMobile}
          ids={props.info['group_ids']}
          names={props.info['group_names']}/>
          <JoinGroupLink additional="another" cookies={props.cookies}/>
        </div>)
      }
    }
    console.log('3')
    return (<JoinGroupLink cookies={props.cookies}/>)  
  }
}

export default UserHomeOptions;