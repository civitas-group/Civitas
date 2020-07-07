import React, { Component, useState } from 'react';
import { Button, Toast, ToastBody, ToastHeader, Badge, 
  Modal, ModalHeader, ModalBody, Form, FormGroup,
  Input, Alert } from 'reactstrap';
import authorizeUser from './Auth';
import { CreateComment, Comments } from './Comments';
import { connect } from 'react-redux'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import './css/Posts.css';

function EmptyPosts(){
  return(
    <h5 style={{color:'grey'}}>No posts made yet.</h5>
  )
}

const Post = (props) => {
  const [likeChanged, setLikeChanged] = useState(false);
  const [liked, setLiked] = 
    useState(props.post.like_ids.indexOf(props.email) !== -1);
  const toggleLike = () => {
    setSubmitting(true);
    let token = props.cookies.get('token');
    let endpoint = '/posts/' +  props.post._id 
      + '/like?like=' + (liked ? '-1' : '1') + '&email=' + props.email;
    console.log(liked, 'like endpoint:', endpoint)

    authorizeUser(token, endpoint, null, 'patch')
      .then(result => {
        console.log("result like:",result)
        if (result){
          console.log('successful liking post', props.post._id)
          if (!likeChanged && !liked){
            props.post.like_ids.push(props.email);
          } 
          if (liked) {
            props.post.likes -= 1;
          } else if (!liked){
            props.post.likes += 1;
          }
          setLiked(!liked);
          setLikeChanged(true);
          setSubmitting(false);
        }
        else {
          console.log('Error liking post', props.post._id)
          props.dispatch({ type: 'LOGOUT' });
        }
      })
      .catch(error => {
        console.log('Error liking post', props.post._id, error)
        props.dispatch({ type: 'LOGOUT' });
      })
  }
  const [likeList, setLikeList] = useState(false);
  const toggleLikeList = () => {
    setLikeList(!likeList);
    console.log(props.post.like_ids)
  }
  const [submitting_like, setSubmitting] = useState(false);

  return (
    <Toast style={{minWidth:"50em"}}>
    <ToastHeader>
      <h5 style={{padding:'0.4em'}}><b>{ props.post.title }</b></h5>
      <Badge color="dark">
        @{ props.post.author }
      </Badge>
      {'  '}
      <small style={{justifyContent:"right"}}>{props.post.created ? 
      props.post.created.slice(0,10) : null}</small>
    </ToastHeader>
  
    <ToastBody>
      <p>{ props.post.body }</p>
    </ToastBody>
    <ToastHeader>
      <Modal isOpen={likeList} toggle={toggleLikeList}>
        <ModalHeader>Likes</ModalHeader>
        <ModalBody>
          {Object.keys(props.post.like_ids).reverse().map(function(key){
            if (props.post.like_ids[key] === props.email && !liked){
              return (null)
            }
            return (
              <div key={key}>{props.post.like_ids[key]}</div>
            );
          })}
        </ModalBody>
      </Modal>
      <Button style={{padding:'0'}}  
        color="link" onClick={toggleLikeList}>
        {liked ? 
        <Badge color="dark">
          <AiFillHeart />{' ' + (props.post.likes)}
        </Badge> :
        <Badge color="dark">
          <AiOutlineHeart/>{' ' + props.post.likes}
        </Badge>}
      </Button>
      <Button disabled={submitting_like} 
        onClick={toggleLike} color='link' size="sm">
        {liked ? ' Unlike' : ' Like'}
      </Button>
    </ToastHeader>
    <ToastHeader>
      <CreateComment 
        username={props.username}
        group_id={props.group_id}
        cookies={props.cookies}
        post_id={props.post._id}
      />
      {props.children && React.cloneElement(props.children, {
        post_id: props.post._id,
        username: props.username,
        cookies: props.cookies
      })}
    </ToastHeader>
    </Toast>
  )
}


const Posts = (props) =>  {
  let posts = props.posts;
  console.log(posts);

  if (Object.keys(props.user_info).length === 0){
    return (null)
  }
  return (
    <div style={{display:"flex"}}>
      <div id="Posts">
        { Object.keys(posts).reverse().map(function(key) {
          return (
            <div key={key}  style={{paddingTop:"2em"}}>
              <Post email={props.user_info.email} 
                post={posts[key]} 
                cookies={props.cookies}
                dispatch={props.dispatch}
                group_id={props.group_id}
                username={props.username}>
                  <Comments cookies={props.cookies}/>
              </Post>
            </div>
          );
        }.bind(this))}
        { Object.keys(posts).length === 0 ? <EmptyPosts />: null}
      </div>
    </div>
  );

}

class CreatePost extends Component {
  constructor(props){
    super(props);
    this.state ={
      modal: false,
      alertOpen: false,
      body_error: false,
      title_error: false,
      title: "",
      body: ""
    };
  }

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
    this.setState({ submit_loading: true })
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
    let req_body = {
      'title':this.state.title, 
      'body': this.state.body,
      'author': this.props.username,
      'group_id': this.props.group_id 
    };
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
      <div> 
        <Button color="primary" onClick={this.toggle}>Create Post</Button>
        <Modal isOpen={this.state.modal} toggle={this.toggle} style={{opacity:"0.9"}}>
          <ModalHeader toggle={this.toggle}>Create a Post</ModalHeader>
          <ModalBody>
            <Alert isOpen={this.state.title_error && this.state.alertOpen}
                toggle={this.DismissAlert} color="danger">
              Title and Body must not be empty
            </Alert>
            <Form onSubmit={(e) => this.submitForm(e)}>
              <FormGroup>
                <Input 
                  type="text" name="title" id="title" placeholder="Title"
                  onChange={(e) => { this.handleChange(e);}}/>
              </FormGroup>
              <FormGroup >
                <Input 
                  type="textarea" name="body" id="body" placeholder="Body" 
                  onChange={(e) => { this.handleChange(e);}}/>
              </FormGroup>
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


const mapStateToProps = (state) => ({
  user_info: state.user_info,
});

export default connect(mapStateToProps, null)(Posts);
export { CreatePost };