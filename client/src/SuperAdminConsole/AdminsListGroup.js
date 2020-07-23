import React, { useState } from 'react';
import authorizeUser from '../Auth'
import { ButtonGroup, Button, Toast, ToastBody, ToastHeader, 
  Row, Col, Alert, Collapse } from 'reactstrap';
import { GrStatusWarning } from 'react-icons/gr';

const RequestedGroup = props => {
  const [showFiles, setShowFiles] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const approveGroup = (user_id, group_id) => {
    console.log('Approve Group', user_id, group_id)
    let token = props.token;

    let apiendpoint = "/group/approve"
    let req_body = {'user_id': user_id, 'group_id': group_id}
    console.log(group_id, apiendpoint)
    authorizeUser(token, apiendpoint, req_body)
      .then(result => {
        console.log("result approve group:",result)
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
    <Row>
      <div style={{padding:'0.2em', paddingLeft:'1em'}}>
        <Toast style={{padding:'0.5em', backgroundColor:'#FFC6C6'}}>
        {props.requested_group_id}
        <Button size="sm" color="link" 
          onClick={()=>{setShowFiles(!showFiles)}}
          style={{paddingBottom:'0.6em'}}>Show Files</Button>
        
        <Collapse isOpen={showFiles}>
          <div style={{textAlign:'left'}}>
          <Alert color="danger" isOpen={errMsg !== ''}
            style={{fontSize:'12px'}}>
            {errMsg}</Alert>
          {Object.keys(props.fileInfo.file_urls).map(
            function(key) {
              return(
                <a href={props.fileInfo.file_urls[key]}
                  target="_blank" rel="noopener noreferrer" >
                  {props.fileInfo.file_storage_type} Link 
                  {' '}{parseInt(key, 10) + 1}</a>
              )
          })}
          <div>
          <ButtonGroup>
          <Button size="sm" color="primary"
            onClick={()=>{approveGroup(props.user_id, 
              props.requested_group_id)}}>
            Approve Group</Button>
          </ButtonGroup>
          </div>
          </div>
        </Collapse>
        </Toast>
      </div>
    </Row>
  )
}
const RequestedGroups = props => {

  return(
    <div>
    <p style={{textAlign:'left', margin:'0'}}>
      {props.requested_groups_ids.length !== 0 ? 
      'Requested Groups' : 'No Requested Groups'}
    </p>
    {Object.keys(props.requested_groups_ids).map(
      function(key) {
        return(
          <RequestedGroup 
            user_id={props.user_id} token={props.token}
            requested_group_id={props.requested_groups_ids[key]}
            fileInfo={props.requested_groups_files[key].fileInfo}/>
        )
    })}
    </div>
  )
}
const ManagedGroups = props => {
  return(
    <div>
    <p style={{textAlign:'left', margin:'0'}}>
      {props.managed_groups_ids.length !== 0 ? 
      'Managed Groups' : 'No Managed Groups'}
    </p>
    {Object.keys(props.managed_groups_ids).map(
      function(key) {
        return(
          <Row>
            <div style={{padding:'0.2em', paddingLeft:'1em'}}>
            <Toast style={{padding:'0.5em', backgroundColor:'#CCFFD3'}}>
            {props.managed_groups_ids[key]}
            <Button href={"/groups/" + props.managed_groups_ids[key]} 
              color="link" size="sm" style={{paddingBottom:'0.5em'}}>
              Visit</Button>
            </Toast>
            </div>
          </Row>
        )
    })}
    </div>
  )
}

const Admin = props => {
  const [errMsg, setErrMsg] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div style={{display:'flex',justifyContent: 'center'}}>
    <Toast style={{width: '70em'}}>
    <Alert color="danger" isOpen={errMsg !== ''}>{errMsg}</Alert>

    {props.is_first ? 
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
        <Col style={{display:'flex',justifyContent: 'left'}}>
        </Col>
      </Row>
    </ToastHeader>
    : null }
      <ToastBody style={{paddingTop:'0', paddingBottom:'0.2em',
        backgroundColor:
        props.admin.requested_groups_ids.length > 0 ?
        '#FFE9AD':'white'}}>
        <Row>
          <Col style={{marginTop:'0.35em',
          paddingLeft:'1em', paddingRight:'1em', display:'flex',
            justifyContent: 'left'}}>
          {props.admin.requested_groups_ids.length > 0 ?
          <GrStatusWarning style={{marginTop:'0.25em'}}/>:null}
          {props.admin.full_legal_name}
          </Col>
          <Col style={{display:'flex',justifyContent: 'left'}}>
          {props.admin.username}
          </Col>
          <Col style={{display:'flex',justifyContent: 'left'}}>
          {props.admin.email}
          </Col>
          <Col style={{display:'flex',justifyContent: 'left'}}>
            <Button color="link" size="sm"
              onClick={()=>{setShowDetails(!showDetails)}}>
              Show Details
            </Button>
          </Col>
        </Row>
        <Collapse isOpen={showDetails}>
          <RequestedGroups 
            user_id={props.admin._id} token={props.token}
            requested_groups_ids={props.admin.requested_groups_ids}
            requested_groups_files={props.admin.requested_groups_files}/>
          <ManagedGroups 
            managed_groups_ids={props.admin.managed_groups_ids}/>
        </Collapse>
      </ToastBody>
    </Toast>
    </div>
  )
}

const AdminsList = props => {


  return(
    Object.keys(props.admins).reverse().map(function(key) {
      return(
        <Admin  key={key} admin={props.admins[key]}
          is_first={(key.toString() === 
            (props.admins.length - 1).toString())}
          token={props.token}/>
      )
    })
  )

}

const AdminsListGroup = props => {
  return (
    <div>
    <Collapse isOpen={props.show_admins}>
      <AdminsList admins={props.admins} token={props.token}/>
    </Collapse>
    </div>
  )
}

export default AdminsListGroup;