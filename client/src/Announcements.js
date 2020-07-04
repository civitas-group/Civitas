import React, { Component, useState } from 'react';
import { Button, Badge, Modal, ModalHeader, ModalBody, 
  Form, FormGroup, UncontrolledTooltip,
  Input, Alert, Collapse, Card, CardBody } from 'reactstrap';
import authorizeUser from './Auth';
import { connect } from 'react-redux'
import { AiFillCaretUp, AiFillCaretDown, 
  AiFillNotification} from 'react-icons/ai';
import { FiMoreHorizontal } from "react-icons/fi";

const Announcement = (props) => {
  console.log('Announcement', props.announcement)

  const [alertVisible, setAlertVisible] = useState(true);
  const onDismiss = () => setAlertVisible(false);
  const [bodyIsOpen, setBodyIsOpen] = useState(false);
  const bodyToggle = () => {
    console.log('Announcement', props.announcement)
    setBodyIsOpen(!bodyIsOpen);
  }
  const [deleteVisible, setDeleteVisible] = useState(false);
  const deleteToggle = () => setDeleteVisible(!deleteVisible);

  const deleteAnnouncement = (announcement_id) => {
    props.dispatch({ type: 'LOADING' });
    let token = props.cookies.get('token');
    let endpoint = '/announcements';
    console.log('announcements delete endpoint:', endpoint)
    authorizeUser(token, endpoint, 
      {group_id: props.group_id, 
      announcement_id: announcement_id}, 'delete')
      .then(result => {
        console.log("result delete announcement:",result)
        if (result){
          window.location.reload(false);
        } else {
          console.log('Error: no result on deleting announcement.')
          props.dispatch({ type: 'LOGOUT' });
        }
      })
      .catch(error => {
        console.log(error)
        props.dispatch({ type: 'LOGOUT' });
      })
  }

  return (
    <div style={{width:'43.7em'}}>
      {props.is_supervisor ? 
      <UncontrolledTooltip target="AnnouncementOptions" trigger="click"
        style={{backgroundColor:"white"}} placement="top">
        <Button onClick={()=>{deleteAnnouncement(props.announcement._id)}} 
          outline size="sm" color="link" 
          style={{padding:'0', color:"red"}}>
          Delete Announcement</Button>
      </UncontrolledTooltip> : null }

      <Alert color="danger" isOpen={alertVisible} toggle={onDismiss}>
        <p style={{marginBottom:'0'}} >
          {props.announcement.title} <Badge color="danger">
          {props.announcement.author} 
          <AiFillNotification onClick={bodyToggle}/></Badge>
          {bodyIsOpen ? 
            <AiFillCaretUp onClick={bodyToggle}/> : 
            <AiFillCaretDown onClick={bodyToggle}/> }
          {props.is_supervisor ? 
          <Button onClick={deleteToggle}  id="AnnouncementOptions"
            color="link" size="sm">
            <FiMoreHorizontal/>
          </Button> : null}
        </p>
        <Collapse isOpen={bodyIsOpen} >
          <Card>
            <CardBody style={{padding:'0.5em', fontSize:"14px"}}>
            {props.announcement.body}
            </CardBody>
          </Card>
        </Collapse>
      </Alert>
    </div>
  )
}

const Announcements = (props) =>  {
  let announcements = props.announcements;

  if (Object.keys(props.user_info).length === 0){
    return (null)
  }
  return (
    <div style={{display:"flex"}}>
      <div id="Announcements">
        { Object.keys(announcements).reverse().map(function(key) {
          return (
            <Announcement key={key}
            dispatch={props.dispatch}
            cookies={props.cookies}
            group_id={props.group_id}
            is_supervisor={props.is_supervisor}
            announcement={announcements[key]}></Announcement>
          );
        }.bind(this))}
      </div>
    </div>
  );

}

class CreateAnnouncement extends Component {
  constructor(props){
    super(props);
    this.state ={
      modal: false,
      alertOpen: false,
      body_error: false,
      title_error: false,
      title: "",
      body: ""
    };
  }

  handleChange = async (event) => {
    const { target } = event;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const { name } = target;
    this.setState({
      [name]: value,
    });
  };

  submitForm(e) {
    e.preventDefault();
    if (this.state.title === '') {
      this.setState({
        title_error: true,
        alertOpen: true
      })
    } else if (this.state.body === '') {
      this.setState({
        body_error: true,
        alertOpen: true
      })
      return;
    }
    let req_body = {
      'title':this.state.title, 
      'body': this.state.body,
      'author': this.props.username,
      'group_id': this.props.group_id }
    let endpoint = "/announcements";
    let token = this.props.cookies.get('token');
    authorizeUser(token, endpoint, req_body)
      .then(result => {
        console.log("result announcement post:",result)
        if (result){
          this.toggle();
          window.location.reload(false);
        }
        else {
          console.log('Error: no result on mount.')
          window.location.reload(false);
        }
      })
      .catch(error => {
        console.log(error)
        window.location.reload(false);
      })
  }

  toggle = () => this.setState({modal: !this.state.modal});
  DismissAlert = () => this.setState({alertOpen: !this.state.alertOpen})
  render(){
    return (
    <div style={{paddingLeft:'0.5em'}}> 
      <Button outline color="danger" onClick={this.toggle}>
        Make Announcement <AiFillNotification/> 
      </Button>
      <Modal isOpen={this.state.modal} toggle={this.toggle} 
        style={{opacity:"0.9"}}>
        <ModalHeader toggle={this.toggle}>
        <Badge color="danger">
          Make an Announcement <AiFillNotification/></Badge>
        </ModalHeader>
        <ModalBody>
          <Alert isOpen={this.state.title_error && this.state.alertOpen}
              toggle={this.DismissAlert} color="danger">
            Title and Body must not be empty
          </Alert>
          <Form onSubmit={(e) => this.submitForm(e)}>
            <FormGroup>
              <Input 
                type="text" name="title" id="title" placeholder="Title"
                onChange={(e) => { this.handleChange(e);}}/>
            </FormGroup>
            <FormGroup >
              <Input 
                type="textarea" name="body" id="body" placeholder="Body" 
                onChange={(e) => { this.handleChange(e);}}/>
            </FormGroup>
            <Button color="link" style={{color:"#D23C4A"}} 
              onClick={this.toggle}>Cancel</Button>
            <Button color="danger" outline 
              onClick={(e) => { this.submitForm(e)} }>Submit</Button>
          </Form>
        </ModalBody>
      </Modal>
    </div>
    );
  }
}


const mapStateToProps = (state) => ({
  user_info: state.user_info,
});

export default connect(mapStateToProps, null)(Announcements);
export { CreateAnnouncement };