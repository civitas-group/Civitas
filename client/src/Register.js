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
      full_legal_name: "",
      username: "",
      password: "",
      password2: "",
      userText: "",
      validate: {
        emailState: "",
        usernameState: "",
        userExists: false,
        passMatch: true,
        passState: ""
      },
      showPass: false,
      loading: false
    };
    this.handleChange = this.handleChange.bind(this);
	  this.submitForm = this.submitForm.bind(this);
  }
  

  validateUsername(e) {
    const usernameRex = /[@~`!#$%\^&*+=\-\[\]\\';,/{}\s|\\":<>\?]/g;
    const { validate } = this.state;

    if (usernameRex.test(e.target.value) || e.target.value === '') {
      // if username contains char from usernameRex, it is invalid
      validate.usernameState = "has-danger";
      console.log("username invalid");
    } else {
      validate.usernameState = "has-success";
      console.log("username valid");
    }
    this.setState({ validate });
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
    const passwordRex = /(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}/g;
    const { validate } = this.state;

    if (!passwordRex.test(e.target.value) || e.target.value === '' || e.target.value.length < 8){
      validate.passState = 'has-danger';
    } else {
      validate.passState = 'has-success';
    }
    this.setState({ validate });
  }

  toggleShowPass(e) {
    let { showPass } = this.state;
    showPass = e.target.checked === true;
    this.setState({ showPass });
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
    let is_supervisor = false;
    if (this.props.usertype === 'admin'){
      is_supervisor = true;
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
    if (this.state.username === '') {
      this.setState({
        validate: {
          usernameState: "has-danger",
          userExists: false,
          passMatch: true
        }
      })
    }
    if (this.state.password === '' || this.state.password2 === '') {
      this.setState({ validate: { userExists: false, 
        passState: 'has-danger' } })
      return;
    }
    this.setState({loading: true})
    console.log(`Email: ${this.state.email}`);
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          "username": this.state.username,
          "full_legal_name": this.state.full_legal_name,
          "password": this.state.password,
          "email": this.state.email,
          "is_supervisor": is_supervisor
        })
    };
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
    const { email, username, full_legal_name, password } = this.state;
    if (this.props.logged_in){
      return (<Redirect to="/groups" />);
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
                type="text"
                name="full_legal_name"
                placeholder="Full Legal Name"
                value={full_legal_name}
                onChange={(e) => {
                  this.handleChange(e);
                }}
              />
            </FormGroup>
          </Col>
          <Col>
            <FormGroup>
              <Input
                type="username"
                name="username"
                placeholder="Username"
                value={username}
                valid={this.state.validate.usernameState === "has-success"}
                invalid={this.state.validate.usernameState === "has-danger"}
                onChange={(e) => {
                  this.validateUsername(e);
                  this.handleChange(e);
                }}
              />
              <FormFeedback valid>Valid Username.</FormFeedback>
              <FormFeedback>Invalid Username. Please use only alphanumeric characters!</FormFeedback>
            </FormGroup>
          </Col>
          <Col>
            <FormGroup>
              <Input
                type={this.state.showPass ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={password}
                valid={this.state.validate.passState === "has-success"}
                invalid={this.state.validate.passState === "has-danger"}
                onChange={(e) => {
                  const {  validate } = this.state;
                  validate.passMatch = (e['target']['value'] === this.state.validate.password2);
                  this.validatePass(e);
                  this.handleChange(e)
                }}
              />
              <FormFeedback valid>Valid Password</FormFeedback>
              <FormFeedback>Password must be at least 8 characters, must contain 1 number and one special character (!@#$%^&*)</FormFeedback>
            </FormGroup>
          </Col>
          <Col>
            <FormGroup>
              <Input
                type={this.state.showPass ? "text" : "password"}
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
          <Col>
            <FormGroup>
              <Input type='checkbox' onClick={(e) => this.toggleShowPass(e)} /> Show Password
            </FormGroup>
          </Col>
          <div>
          { this.state.loading ? <Spinner 
          style={{ width: '1rem', height: '1rem' }} /> : null }
          </div>
          <Button color="primary">Submit</Button>
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