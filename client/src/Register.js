import React, { Component } from "react";
import {
  Container,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  FormText,
  FormFeedback,
} from "reactstrap";
import "./Register.css";

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      username: "",
      password: "",
      validate: {
        emailState: "",
      },
    };
    this.handleChange = this.handleChange.bind(this);
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
    e.preventDefault();
    console.log(`Email: ${this.state.email}`);
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "username": "sampleuser6",
            "password": "samplepass6",
            "email": this.state.email,
            "is_supervisor": 0
        })
    };
    fetch('http://localhost:8080/api/signup/regular', requestOptions)

  }
  render() {
    const { email, password } = this.state;
    return (
      <Container className="App">
        <h2>Register</h2>
        <Form className="form" onSubmit={(e) => this.submitForm(e)}>
          <Col>
            <FormGroup>
              <Label>Username</Label>
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
                onChange={(e) => this.handleChange(e)}
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
              />
            </FormGroup>
          </Col>
          <Button>Submit</Button>
        </Form>
      </Container>
    );
  }
}

export default Register;
