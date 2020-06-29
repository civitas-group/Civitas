import React, { Component } from "react";
import {
  Container,
  Col,
  Form,
  FormGroup,
  Input,
  Button,
  FormFeedback,
  Alert,
  Spinner
} from "reactstrap";
import { Redirect } from 'react-router';
import { connect } from 'react-redux'
import "./css/Register.css";

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      username: "",
      password: "",
      password2: "",
      userText: "",
      validate: {
        emailState: "",
        userExists: false,
        passMatch: true,
        passEmpty: ""
      },
      loading: false
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
  validatePass(e) {
    const { validate } = this.state;
    if (e.target.value === ''){
      validate.passEmpty = 'empty';
    } else {
      validate.passEmpty = 'not-empty';
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
    e.preventDefault();
    let is_supervisor = 0;
    if (this.props.usertype === 'admin'){
      is_supervisor = 1;
    }
    if (this.state.email === '') {
      this.setState({
        validate: {
          emailState: "has-danger",
          userExists: false,
          passMatch: true
        }
      })
      return;
    }
    if (this.state.password === '' || this.state.password2 === '') {
      this.setState({ validate: { userExists: false, 
        passEmpty: 'empty' } })
      return;
    }
    this.setState({loading: true})
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
    //fetch('http://' + process.env.host + ':8080/api/signup/regular', requestOptions)
    let apiurl = '';
    if (process.env.NODE_ENV  === 'development') {
      apiurl = 'http://localhost:8080/api/signup/' 
        + this.props.usertype;
    }
    else { 
      apiurl = process.env.REACT_APP_AWS_URL 
        + '/api/signup/' + this.props.usertype; 
    }

    //axios.post(apiurl, requestOptionsAxios)
    fetch(apiurl, requestOptions)
      .then(async response => {
        const data = await response.json();
        const { validate } = this.state;
        this.setState({loading: false})
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
            this.props.toggleModal();
            const { cookies } = this.props;
            cookies.set('token', data['token'], 
              { path: '/', sameSite: true,});
            validate.emailState = "has-success";
            validate.userExists = false;
            
            this.setState({ validate });
            this.props.dispatch({ type: 'LOGIN' });         
            //return (<Redirect to={"/home"} />)
        }
      })
      .catch(error => {
        this.setState({loading: false})
        console.log('There was an error!', error);
        const { validate } = this.state;
        validate.emailState = "has-danger";
        validate.userExists = this.state.validate.userExists;
        this.setState({ validate });
      });
  }
  render() {
    const { email, username, password } = this.state;
    if (this.props.logged_in){
      return (<Redirect to="/home" />);
    }

    return (  
      <div>
      <Container className="App">

      <Alert isOpen={this.state.validate.userExists} color="danger">
        Email or username already in use.
      </Alert>
        <Form className="form" onSubmit={(e) => this.submitForm(e)}>
          <Col>
            <FormGroup>
              <Input
                type="email"
                name="email"
                id="exampleEmail"
                placeholder="Email Address"
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
              <Input
                type="username"
                name="username"
                id="exampleUsername"
                placeholder="Username"
                value={username}
                onChange={(e) => this.handleChange(e)}
              />
            </FormGroup>
          </Col>
          <Col>
            <FormGroup>
              <Input
                type="password"
                name="password"
                id="examplePassword"
                placeholder="Password"
                value={password}
                valid={this.state.validate.passEmpty === "not-empty"}
                invalid={this.state.validate.passEmpty === "empty"}
                onChange={(e) => {
                  const {  validate } = this.state;
                  validate.passMatch = (e['target']['value'] === this.state.validate.password2);
                  this.validatePass(e);
                  this.handleChange(e)
                }}
				        //onChange = { console.log('e') }
              />
              <FormFeedback valid>Password okay.</FormFeedback>
              <FormFeedback>Please enter a password.</FormFeedback>
            </FormGroup>
          </Col>
          <Col>
            <FormGroup>
              <Input
                type="password"
                name="password2"
                id="exampleConfirmPassword"
                placeholder="Confirm Password"
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
          <div>
          { this.state.loading ? <Spinner 
          style={{ width: '1rem', height: '1rem' }} /> : null }
          </div>
          <Button>Submit</Button>
        </Form>
      </Container>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  logged_in: state.logged_in
});
export default connect(mapStateToProps)(Register);
//export default Register;