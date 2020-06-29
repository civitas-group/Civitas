import React, { Component } from 'react';
import { Alert, Button, Form, FormGroup, Input } from 'reactstrap';
import authorizeUser from './Auth';

class CreateComment extends Component {
  state = {
    commentBody: "",
    commentBodyError: false
  };

  constructor (props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.submitForm = this.submitForm.bind(this);
  };

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
    if (this.state.commentBody === "") {
      this.setState({
        commentBodyError: true
      });
    } else {
      this.setState({
        commentBodyError: false
      });
    }

    // construct the request to create a comment
    let req_body = {
      'author': this.props.username,
      'is_reply': false,
      'text': this.state.commentBody,
      'post_id': this.props.post_id
    };
    let endpoint = '/comments/create-comment';
    let token = this.props.cookies.get('token');

    // make api request to create comment
    authorizeUser(token, endpoint, req_body).then(result => {
      console.log("result comment: ", result);
    }).catch(error => {
      console.log(error);
    });
  }

  render() {
    return (
      <div>
        <Alert isOpen={this.state.commentBodyError} color="danger">
          Comment cannot be empty!
        </Alert>
        <Form onSubmit={this.submitForm}>
          <FormGroup>
            <Input type="textarea" name="commentBody" id="commentBody" 
              placeholder="Comment here"
              style={{width: "280%"}} 
              onChange={(e) => { this.handleChange(e); }} />
          </FormGroup>
          <Button color="primary" size="sm">Comment</Button>
        </Form>
      </div>
    );
  }
}

export { CreateComment };