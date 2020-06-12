import React, { Component } from 'react';
import {
  Container, Col, Form,
  FormGroup, Label, Input,
  Button, Alert
} from 'reactstrap';
import { Redirect } from 'react-router';
import './Login.css';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email_username: "",
      password: "",
      login_result: {
        login_success: false,
        error: ""
      }
    };
    this.handleChange = this.handleChange.bind(this);
	  this.submitForm = this.submitForm.bind(this);
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
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "email_username": this.state.email_username,
        "password": this.state.password,
      })
    };

    let apiurl = 'http://localhost:8080/api/authorize/login';
    fetch(apiurl, requestOptions).then(async response => {
      const data = await response.json();
      const { login_result } = this.state;

      // check for errors
      if (!response.ok) {
        console.log('There was an error!', data['error'], data.message, response.status);
        login_result.error = data['error'];
        this.setState({ login_result });
        console.log(this.state.login_result);
      } else {
        const { cookies } = this.props;
        cookies.set('token', data['token'], { path: '/', sameSite: true,});

        login_result.login_success = true;
        this.setState({ login_result });
      }
    })
    .catch(error => {
      console.log('There was an error!', error);
      const { login_result } = this.state;
      login_result.error = error;
      this.setState({ login_result });
      console.log(this.state.login_result);
    });
  }

  render() {
    const { email_username, password } = this.state;
    if (this.state.login_result.login_success === true) {
      return (<Redirect to="/home" />);
    }
    return (
      <Container className="App">
        <h2 style={{textAlign:"left"}}>Sign In</h2>
        <Alert isOpen={this.state.login_result.error !== ""} color="danger">
          {this.state.login_result.error}
        </Alert>
        <Form className="form" onSubmit={(e) => this.submitForm(e)}>
          <Col>
            <FormGroup>
              <Label>Email/Username</Label>
              <Input
                type="email_username"
                name="email_username"
                id="example_email_username"
                onChange={(e) => {
                  this.handleChange(e);
                }}
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
                onChange={(e) => {
                  this.handleChange(e);
                }}
              />
            </FormGroup>
          </Col>
          <Button>Submit</Button>
        </Form>
      </Container>
    );
  }
}

export default Login;