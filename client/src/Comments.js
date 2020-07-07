import React, {  Component, useState, useEffect } from 'react';
import { Container, Alert, Button, Form, FormGroup, Input, 
  Badge, ToastBody, Toast } from 'reactstrap';
import authorizeUser from './Auth';
import { connect } from 'react-redux'
import './css/Comments.css'
import { BsFillPersonFill } from "react-icons/bs";


const Comment = (props) => {
  const [showOptions, setShowOptions] = useState(false);
  const [makingReply, setMakingReply] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const makeReply = () => {
    setShowOptions(false);
    setMakingReply(true);
    setDeleteConfirm(false);
  }
  const cancelReply = () => {
    setShowOptions(true);
    setMakingReply(false);
  }
  const deleteComment = (comment_id) => {
    props.dispatch({ type: 'LOADING' });
    let token = props.cookies.get('token');
    let endpoint = '/comments/' + comment_id;
    console.log('comment delete endpoint:', endpoint)
    authorizeUser(token, endpoint, 
      {group_id: props.group_id, 
        post_id: props.post_id}, 'delete')
      .then(result => {
        console.log("result delete comment:",result)
        if (result){
          window.location.reload(false);
        } else {
          console.log('Error: no result on deleting comment.')
          props.dispatch({ type: 'LOGOUT' });
        }
      })
      .catch(error => {
        console.log(error)
        props.dispatch({ type: 'LOGOUT' });
      })
  }
  
  return (
    <Toast onMouseEnter={()=>{if(!makingReply) setShowOptions(true)}}
      onMouseLeave={()=>{if(!makingReply) setShowOptions(false)}}>
      <ToastBody style={{display:'flex',
        paddingBottom: (showOptions ? '0' : '1em')}}>
      
      { props.is_comment_author ? 
      <strong style={{color:'#3771DA'}}><BsFillPersonFill/></strong>: 
      <strong style={{color:'#3771DA'}}>{props.comment.author}</strong>
      }
      {' '}
      <Container className="themed-container" fluid="lg">
        {props.comment.text}</Container>
      
      </ToastBody>
      {makingReply ? 
        <div style={{paddingLeft:'0.7em'}}>
          <CreateComment 
            username={props.username}
            group_id={props.group_id}
            cookies={props.cookies}
            post_id={props.post_id}
            post_owner={props.comment.post_owner}
            is_reply={true}
            author_replying_to={props.comment.author}/>
            </div>: null }
      {showOptions ? 
      <Button onClick={makeReply}color="link" size="sm" 
        style={{paddingLeft:'0.7em'}}>
        Reply</Button> : (makingReply ? 
        <Button onClick={cancelReply}color="link" size="sm" 
        style={{paddingLeft:'0.7em'}}>
          Cancel</Button>: null) }
      {showOptions && 
      (props.is_post_owner || props.is_supervisor || props.is_comment_author) ?
      deleteConfirm ?
      <div>
        <Button size="sm" outline color="danger"
          onClick={()=>{deleteComment(props.comment._id)}}>
            Delete Comment?</Button>
        <Button size="sm" outline 
          onClick={()=>{setDeleteConfirm(false)}}>Cancel</Button>
      </div> 
      : <Button onClick={()=>{setDeleteConfirm(true)}} 
      color="link" size="sm" style={{paddingLeft:'0.7em'}}>
      Delete</Button>:null}
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
              <Comment comment={comments[key]}
                dispatch={props.dispatch}
                cookies={props.cookies}
                group_id={props.group_id}
                post_id={props.post_id}
                username={props.username}
                is_post_owner={props.is_post_owner}
                is_supervisor={props.is_supervisor}
                is_comment_author={props.username === comments[key].author}/>
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
    if (this.props.is_reply){
      req_body.text = '@' + this.props.author_replying_to + ' ' + req_body.text
    }
    let endpoint = '/comments/create-comment';
    let token = this.props.cookies.get('token');

    // make api request to create comment
    authorizeUser(token, endpoint, req_body).then(result => {
      console.log("result comment: ", result);
      window.location.reload(false);
    }).catch(error => {
      console.log(error);
      window.location.reload(false);
    });
  }

  render() {
    return (
      <div>
        <Form onSubmit={this.submitForm}>
          <FormGroup>
            <Input type="text" name="commentBody" id="commentBody" 
              placeholder={this.props.is_reply ? "Reply" : "Comment here"}
              onChange={(e) => { this.handleChange(e); }} />
              <Alert style={{padding:'0.7em'}}
                isOpen={this.state.commentBodyError} color="danger">
                Comment cannot be empty!
              </Alert>
          </FormGroup>
        </Form>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  user_info: state.user_info,
});

export default connect(mapStateToProps, null)(Comments);
export { CreateComment };