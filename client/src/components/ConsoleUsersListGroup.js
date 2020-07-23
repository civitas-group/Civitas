import React, { useState } from 'react';
import authorizeUser from '../Auth'
import { ButtonGroup, Button, Toast, ToastBody, ToastHeader, 
  Row, Col, Alert, Collapse } from 'reactstrap';
  import Loading from './Loading'

const ConsoleUsersList = props => {
  const [errMsg, setErrMsg] = useState("");

  const ApproveRequest = (user_id, type) => {
    console.log('Approve', user_id, props.group_id)
    let token = props.token;
    console.log(token)

    let apiendpoint = "/group"
    if (type === 'accept'){
      apiendpoint += "/accept_user_request/" + props.group_id;
    } else {
      apiendpoint += "/deny_user_request/" + props.group_id;
    }

    console.log(props.group_id, apiendpoint)
    authorizeUser(token, apiendpoint, {'user_id':user_id}, 'patch')
      .then(result => {
        console.log("result approve request:",result)
        if (result){
          console.log(result)
          window.location.reload(false);
        }
        else {
          console.log('Error')
          setErrMsg("An error has occurred. Please refresh and try again.")
        }
      })
      .catch(error => {
        console.log(error)
        setErrMsg("An error has occurred. Please refresh and try again.")
      })
  }

  return(
    Object.keys(props.users).reverse().map(function(key) {
      return(
        <div key={key}  style={{display:'flex',justifyContent: 'center'}}>
        <Toast style={{width: '50em'}}>
        <Alert color="danger" isOpen={errMsg !== ''}>{errMsg}</Alert>

        {(key.toString() === (props.users.length - 1).toString()) ? 
          <ToastHeader>
          <Row>
            <Col style={{marginTop:'0.35em',
            paddingLeft:'1em', paddingRight:'1em', display:'flex',
              justifyContent: 'left'}}>
            Full Legal Name
            </Col>
            <Col style={{display:'flex',justifyContent: 'left'}}>
            Username
            </Col>
            <Col style={{display:'flex',justifyContent: 'left'}}>
            Email
            </Col>
            {props.type === 'requested' ? 
            <Col style={{display:'flex',justifyContent: 'left'}}>
            {' '}
            </Col> : null}
          </Row>
        </ToastHeader>
        : null }
          <ToastBody style={{paddingTop:'0', paddingBottom:'0.2em'}}>
            <Row>
              <Col style={{marginTop:'0.35em',
              paddingLeft:'1em', paddingRight:'1em', display:'flex',
                justifyContent: 'left'}}>
              {props.users[key].full_legal_name}
              </Col>
              <Col style={{display:'flex',justifyContent: 'left'}}>
              {props.users[key].username}
              </Col>
              <Col style={{display:'flex',justifyContent: 'left'}}>
              {props.users[key].email}
              </Col>
              {props.type === 'requested' ? 
              <Col style={{display:'flex',justifyContent: 'right'}}>
                <ButtonGroup>
                <Button size="sm"color="primary"
                  onClick={()=>{ApproveRequest(props.user_ids[key], 
                    'accept')}}>Approve</Button>
                <Button size="sm"color="danger"
                  onClick={()=>{ApproveRequest(props.user_ids[key], 
                    'deny')}}>Deny</Button>
                </ButtonGroup>
              </Col> : null}
            </Row>
          </ToastBody>
        </Toast>
        </div>
      )
    })
  )

}

const ConsoleUsersListGroup = props => {
  return (
    <div>
      <Collapse isOpen={props.show_requested_to_join_users}>
      {props.requested_to_join_user_ids.length !==
        props.requested_to_join_users.length ? 
        <div style={{paddingTop:'1em'}}>
          <Loading component="Requested Users" 
            primary={true} relative={true}/>
        </div>
      : <ConsoleUsersList type="requested" 
          token={props.token}
          dispatch={props.dispatch}
          group_id={props.group_id}
          users={props.requested_to_join_users}
          user_ids={props.requested_to_join_user_ids}/>}
    </Collapse>

    <Collapse isOpen={props.show_invited_users}>
    {props.invited_user_ids.length !==
        props.invited_users.length ? 
        <div style={{paddingTop:'1em'}}>
          <Loading component="Invited Users" 
            primary={true} relative={true}/></div>
      : <ConsoleUsersList type="invited" users={props.invited_users}/>}
    </Collapse>

    <Collapse isOpen={props.show_users}>
      {props.user_ids.length !==
        props.users.length ? 
        <div style={{paddingTop:'1em'}}>
          <Loading component="Joined Users" 
            primary={true} relative={true}/>
        </div>
      : <ConsoleUsersList type="joined" users={props.users}/>}
    </Collapse>
    </div>
  )
}

export default ConsoleUsersListGroup;