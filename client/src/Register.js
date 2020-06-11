import React, { Component } from "react";
import {
  Container,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  FormFeedback,
  Alert
} from "reactstrap";
import { Redirect } from 'react-router';
import "./Register.css";
import axios from 'axios';

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      username: "",
      password: "",
	    password2: "",
      validate: {
        emailState: "",
        userExists: false,
        passMatch: true,
        registerSuccess: false
      }
    };
    this.handleChange = this.handleChange.bind(this);
	  this.submitForm = this.submitForm.bind(this);
  }
  

  validateEmail(e) {
    const emailRex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const { validate } = this.state;
    if (emailRex.test(e.target.value)) {
      validate.emailState = "has-success";
    } else {
      validate.emailState = "has-danger";
    }
    this.setState({ validate });
  }

  handleChange = async (event) => {
    const { target } = event;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const { name } = target;
    await this.setState({
      [name]: value,
    });
  };

  submitForm(e) {
    let is_supervisor = 0;
    if (this.props.usertype === 'admin'){
      is_supervisor = 1;
    }

    e.preventDefault();
    console.log(`Email: ${this.state.email}`);
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "username": this.state.username,
          "password": this.state.password,
          "email": this.state.email,
          "is_supervisor": is_supervisor
        })
    };
    const requestOptionsAxios = {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "username": this.state.username,
        "password": this.state.password,
        "email": this.state.email,
        "is_supervisor": is_supervisor
      })
  };
    //fetch('http://' + process.env.host + ':8080/api/signup/regular', requestOptions)
    let apiurl = 'http://localhost:8080/api/signup/' + this.props.usertype;
    
    //axios.post(apiurl, requestOptionsAxios)
    fetch(apiurl, requestOptions)
        .then(async response => {
          const data = await response.json();
          const { validate } = this.state;
    
          // check for error response
          if (!response.ok) {
              // get error message from body or default to response status
            console.log('There was an error!', data['error'], data.message, 
              response.status);
      
            if (data['error'].includes('E11000')) {
              validate.emailState = "has-danger";
              validate.userExists = true;
            } else {
              validate.emailState = "has-success";
              validate.userExists = this.state.validate.userExists;
            }
            this.setState({ validate });
            console.log(this.state.validate.emailState);
          }
          // Ok response
          else {
              //localStorage.setItem('token', data['token']);
              const { cookies } = this.props;
              cookies.set('token', data['token'], 
                { path: '/', sameSite: true,});
              validate.emailState = "has-success";
              validate.userExists = false;
              validate.registerSuccess = true;
              
              this.setState({ validate });              
              //return (<Redirect to={"/home"} />)
          }
        })
        .catch(error => {
          console.log('There was an error!', error);
          const { validate } = this.state;
          validate.emailState = "has-danger";
          validate.userExists = this.state.validate.userExists;
          this.setState({ validate });
        });
  }
  render() {
    const { email, username, password } = this.state;
    if (this.state.validate.registerSuccess === true){
      return (<Redirect to="/home" />);
    }
    return (  
      <div>
      <h1 style={{textAlign:"center"}}>{this.props.usertype}</h1>
      <Container className="App">
        <h2 style={{textAlign:"left"}}>Register</h2>
      <Alert isOpen={this.state.validate.userExists} color="danger">
        Email or username already in use.
      </Alert>
        <Form className="form" onSubmit={(e) => this.submitForm(e)}>
          <Col>
            <FormGroup>
              <Label className="btn-flat">Email</Label>
              <Input
                type="email"
                name="email"
                id="exampleEmail"
                placeholder="myemail@email.com"
                value={email}
                valid={this.state.validate.emailState === "has-success"}
                invalid={this.state.validate.emailState === "has-danger"}
                onChange={(e) => {
                  this.validateEmail(e);
                  this.handleChange(e);
                }}
              />
              <FormFeedback valid>Valid email.</FormFeedback>
              <FormFeedback>Invalid email.</FormFeedback>
            </FormGroup>
          </Col>
          <Col>
            <FormGroup>
              <Label>Username</Label>
              <Input
                type="username"
                name="username"
                id="exampleUsername"
                placeholder="username"
                value={username}
                onChange={(e) => this.handleChange(e)}
              />
            </FormGroup>
          </Col>
          <Col>
            <FormGroup>
              <Label for="examplePassword">Password</Label>
              <Input
                type="password"
                name="password"
                id="examplePassword"
                placeholder="********"
                value={password}
                onChange={(e) => {
                  const {  validate } = this.state;
                  validate.passMatch = (e['target']['value'] === this.state.validate.password2);
                  this.setState({ validate });
                  this.handleChange(e)
                }}
				        //onChange = { console.log('e') }
              />
            </FormGroup>
          </Col>
          <Col>
            <FormGroup>
              <Label for="exampleConfirmPassword">Confirm Password</Label>
              <Input
                type="confirmpassword"
                name="confirmpassword"
                id="exampleConfirmPassword"
                placeholder="*********"
                invalid={!this.state.validate.passMatch}
                onChange={(e) => {
                  const { validate } = this.state;
                  validate.password2 = e['target']['value'];
                  validate.passMatch = (e['target']['value'] === this.state.password);
                  this.setState({ validate });
                  this.handleChange(e)
                }}
              />
			      <FormFeedback>Passwords don't match.</FormFeedback>
            </FormGroup>
          </Col>
          <Button>Submit</Button>
        </Form>
      </Container>
      </div>
    );
  }
}

export default Register;