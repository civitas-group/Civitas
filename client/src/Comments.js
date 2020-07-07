import React, { Component, useState, useEffect } from 'react';
import { Alert, Button, Form, FormGroup, Input, ToastBody, Toast } from 'reactstrap';
import authorizeUser from './Auth';
import { connect } from 'react-redux'
import './css/Comments.css'

const Comment = (props) => {
  return (
    <Toast style={{'margin': '2%'}}>
      <div style={{'margin': '2%'}}>
        <strong>{props.comment.author}</strong>
        <p>{props.comment.text}</p>
      </div>
    </Toast>
  );
}

const Comments = (props) => {
  const [comments, setComments] = useState([]);
  const [isLoadingComments, setLoadingComments] = useState(true);

  let endpoint = '/comments/get-comments/' + props.post_id;
  let token = props.cookies.get('token');

  useEffect(() => {
    authorizeUser(token, endpoint, null, 'get').then(result => {
      console.log("result comments: ", result);
      if (result) {
        setComments(result.data.data.comments);
        setLoadingComments(false);
        console.log("LOADED COMMENTS");
      }
    }).catch(error => {
      console.log("error getting comments: ", error);
    });
  }, []);

  console.log("is loading comments: ", isLoadingComments);
  if (!comments || comments.length === 0) {
    console.log("NULL COMMENTS");
    return (null);
  }

  console.log("NON NULL COMMENTS");
  console.log("is loading comments: ", isLoadingComments);
  return (
    <div style={{display:"flex"}}>
      { isLoadingComments ? (<h4>Loading Comments</h4>) : (
        <div id="Comments" style={{'width': '100%'}}>
        { Object.keys(comments).map(function(key) {
          return (
            <div key={key}>
              <Comment comment={comments[key]}/>
            </div>
          )
        }.bind(this))}
      </div>
      )}
    </div>
  );
}

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
      'post_id': this.props.post_id,
      'post_owner': this.props.post_owner
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
              onChange={(e) => { this.handleChange(e); }} />
          </FormGroup>
          <Button color="primary" size="sm">Comment</Button>
        </Form>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user_info: state.user_info,
});

export default connect(mapStateToProps, null)(Comments);
export { CreateComment, Comments };