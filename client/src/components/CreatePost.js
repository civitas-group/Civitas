import React, { Component } from 'react';
import { Button, Badge, Row, CustomInput, Collapse,
  Modal, ModalHeader, ModalBody, Form, FormGroup,
  Input, Alert } from 'reactstrap';
import authorizeUser from '../Auth';
import { RiShoppingBasketLine } from 'react-icons/ri';
import TextField from '@material-ui/core/TextField';

class CreatePost extends Component {
  now = new Date();
  dd = String(this.now.getDate()).padStart(2, '0');
  mm = String(this.now.getMonth() + 1).padStart(2, '0'); //January is 0!
  yyyy = this.now.getFullYear();
  today = this.yyyy + '-' + this.mm + '-' + this.dd;
  
  constructor(props){
    super(props);
    this.state ={
      modal: false,
      alertOpen: false,
      body_error: false,
      title_error: false,
      date_error: "",
      title: "",
      body: "",
      title_text: this.props.is_request ? 'Request Title' : 'Title',
      body_text: this.props.is_request ? 'Request Body' : 'Body',
      date: "2020-07-23",
      time: "15:00",
      is_timed: false,
      expires_on: ""
    };
  }
  // validate if time has already passed
  validateDatePassed(date){
    let now = new Date()
    if (date < now) return true
    return false;
  }
  // time is within 5 minutes of now
  validateDateTooSoon(date){
    let now = new Date()
    let diff = Math.abs(date - now);
    if ((diff / 60000) < 5) return true
    return false;
  }

  dateParse(date, time){
    let split = date.split('-');
    let year = split[0];
    let month = split[1];
    let day = split[2];
    
    split = time.split(':')
    let hours = split[0];
    let minutes = split[1];
    
    let temp = new Date(year, parseInt(month, 10) - 1, day);
    temp.setHours(hours)
    temp.setMinutes(minutes)
  
    return temp;
  }
  handleChange = async (event) => {
    const { target } = event;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let { name } = target;

    if (target.type === "checkbox"){
      value = target.checked;
      const { id } = target;
      await this.setState({
        [id]: value,
      })
    } else {
      this.setState({
        [name]: value,
      });
      if (name === 'time' || name === 'date'){
        console.log(this.dateParse(this.state.date, this.state.time))
      }
    }

  };

  async submitForm(e) {
    e.preventDefault();
    //this.setState({ submit_loading: true })
    if (this.state.title === '') {
      this.setState({
        title_error: true,
        alertOpen: true,
        submit_loading: false
      })
      return;
    } else if (this.state.body === '') {
      this.setState({
        body_error: true,
        alertOpen: true,
        submit_loading: false
      })
      return;
    }
    else if (this.state.is_timed) {
      let date = this.dateParse(this.state.date, this.state.time);
      await this.setState({ expires_on: date })
      if (this.validateDatePassed(date)){
        console.log('Expiry time has already passed.')
        this.setState({
          date_error: 'Expiry time has already passed.',
          alertOpen: true,
          submit_loading: false
        })
        return;
      }
      if (this.validateDateTooSoon(date)){
        console.log('Expiry time must be within 5 minutes.')
        this.setState({
          date_error: 'Expiry time must be within 5 minutes.',
          alertOpen: true,
          submit_loading: false
        })
        return;
      } 
    }

    let req_body = {
      'title':this.state.title, 
      'body': this.state.body,
      'author': this.props.username,
      'group_id': this.props.group_id,
      'is_request': this.props.is_request,
      'is_timed': this.state.is_timed,
    };
    if (this.state.is_timed) {
      req_body = Object.assign(req_body, { 
        'expires_on': this.state.expires_on 
      })
    }
    let endpoint = "/posts";
    let token = this.props.cookies.get('token');
    authorizeUser(token, endpoint, req_body)
      .then(result => {
        console.log("result group:",result)
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
      <div style={{paddingLeft: this.props.is_request ? '0.5em' :'0'}}> 
        <Button outline={this.props.is_request} color="primary" onClick={this.toggle} >
          {this.props.is_request ? 'Make Request' :'Create Post'} {' '}
          {this.props.is_request ? <RiShoppingBasketLine/> : null}
          </Button>
        <Modal isOpen={this.state.modal} toggle={this.toggle} style={{opacity:"0.9"}}>
          <ModalHeader toggle={this.toggle}>
          {this.props.is_request ? <Badge color="primary">
          Make a Request <RiShoppingBasketLine/></Badge> :'Create a Post'}
          
          </ModalHeader>
          <ModalBody>
            <Alert isOpen={this.state.title_error && this.state.alertOpen}
                toggle={this.DismissAlert} color="danger">
              Title and Body must not be empty
            </Alert>
            <Alert isOpen={this.state.date_error !== '' && this.state.alertOpen}
                toggle={this.DismissAlert} color="danger">
              {this.state.date_error}
            </Alert>

            
            <Form onSubmit={(e) => this.submitForm(e)}>
              <FormGroup>
                <Input 
                  type="text" name="title" id="title" 
                  placeholder={this.state.title_text}
                  onChange={(e) => { this.handleChange(e);}}/>
              </FormGroup>
              <FormGroup >
                <Input 
                  type="textarea" name="body" id="body" 
                  placeholder={this.state.body_text}
                  onChange={(e) => { this.handleChange(e);}}/>
              </FormGroup>
              {this.props.is_request ?
              <FormGroup style={{paddingLeft:'0.2em', fontSize:'14px'}}>
                <CustomInput type="checkbox" 
                  defaultChecked={this.state.is_timed} 
                  id="is_timed" 
                  label={this.state.is_timed ?  
                    "Timed Request" +  
                  " (must not expire within 5 minutes)" 
                  : "Timed Request"}
                  onChange={(e) => { this.handleChange(e);}}/>
              </FormGroup> : null }
              <Collapse isOpen={this.state.is_timed}>
                <Row style={{paddingLeft:'1.2em', paddingBottom:'1.2em'}}>
                  <TextField
                    id="date"
                    label="Expiry Date"
                    type="date"
                    name="date"
                    defaultValue={this.state.date}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    onChange={(e) => { this.handleChange(e);}}
                  />
                  <TextField
                    id="time"
                    label="Expiry Time"
                    name="time"
                    type="time"
                    defaultValue={this.state.time}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 300, // 5 min
                    }}
                    onChange={(e) => { this.handleChange(e);}}
                  />
                </Row>
              </Collapse>
              <Button color="link" disabled={this.state.submit_loading} 
                onClick={this.toggle}>Cancel</Button>
              <Button color="primary" disabled={this.state.submit_loading} 
                onClick={(e) => { this.submitForm(e)} }>Submit</Button>
            </Form>
            
          </ModalBody>
        </Modal>

      </div>
    );
  }
}

export default CreatePost;