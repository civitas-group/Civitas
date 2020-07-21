import React, { Component } from 'react';
import {
  Container, Col, Form,
  FormGroup, Input,
  Button, Alert, Spinner
} from 'reactstrap';
import { Redirect } from 'react-router';
import { connect } from 'react-redux'
import './css/Login.css';

class Login extends Component {
  constructor(props) {
    super(props);
    console.log("PROPS:", props);
    this.state = {
      email_username: Object.keys(this.props.formData).length === 0 ? "" : this.props.formData.email_username,
      password: Object.keys(this.props.formData).length === 0 ? "" : this.props.formData.password,
      login_result: {
        error: ""
      },
      loading: false
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
    console.log("SETLOGIN PARAM OBJECT:", {
      email_username: this.state.email_username,
      password: this.state.password
    });
    this.props.setFormData({
      email_username: this.state.email_username,
      password: this.state.password
    });
  };

  submitForm(e) {
    e.preventDefault();
    if (this.state.email_username === '') {
      this.setState({
        login_result: {
          error: "Please enter your email or username."
        }
      })
      return;
    }
    if (this.state.password === '') {
      this.setState({
        login_result: {
          error: "Please enter your password."
        }
      })
      return;
    }
    this.setState({loading: true})
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "email_username": this.state.email_username,
        "password": this.state.password,
      })
    };

    let apiurl = '';
    if (process.env.NODE_ENV  === 'development') {
      apiurl = 'http://localhost:8080/api/authorize/login';
    }
    else { 
      apiurl = process.env.REACT_APP_AWS_URL + '/api/authorize/login'; 
    }

    fetch(apiurl, requestOptions).then(async response => {
      const data = await response.json();
      const { login_result } = this.state;
      this.setState({loading: false})
      // check for errors
      if (!response.ok) {
        
        if ('error' in data){
          console.log('There was an error!', data['error'], data.message, response.status);
          login_result.error = data['error'];
        } else {
          login_result.error = 'An unknown error has occurred. Please try again.';
        }
        this.setState({ login_result });
        console.log(this.state.login_result);
      } else {
        this.props.toggleModal();
        const { cookies } = this.props;
        cookies.set('token', data['token'], { path: '/', sameSite: true,});

        this.setState({ login_result });
        this.props.dispatch({ type: 'LOGIN' });
      }
    })
    .catch(error => {
      this.setState({loading: false})
      console.log('There was an error!', error);
      const { login_result } = this.state;
      login_result.error = error;
      this.setState({ login_result });
      console.log(this.state.login_result);
    });
  }

  render() {
    if (this.props.logged_in) {
      return (<Redirect to="/groups" />);
    }
    return (
      <Container className="App">
        <Alert isOpen={this.state.login_result.error !== ""} color="danger">
          {this.state.login_result.error}
        </Alert>
        <Form className="form" onSubmit={(e) => this.submitForm(e)}>
          <Col>
            <FormGroup>
              <Input
                type="email_username"
                name="email_username"
                id="example_email_username"
                placeholder="Email or Username"
                value={this.state.email_username}
                onChange={(e) => {
                  this.handleChange(e);
                }}
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
                value={this.state.password}
                onChange={(e) => {
                  this.handleChange(e);
                }}
              />
            </FormGroup>
          </Col>
          <div>
          { this.state.loading ? <Spinner 
          style={{ width: '1rem', height: '1rem' }} /> : null }
          </div>
          <Button color="primary">Submit</Button>
          
        </Form>
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  logged_in: state.logged_in
});
export default connect(mapStateToProps)(Login);