import React, { Component } from 'react';
import { Toast, ToastBody, ToastHeader, Badge, Button, 
  Modal, ModalHeader, ModalBody, Form, FormGroup,
  Input, Alert } from 'reactstrap';
import authorizeUser from './Auth';
import { CreateComment } from './Comments';

function EmptyPosts(){
  return(
    <h5 style={{color:'grey'}}>No posts made yet.</h5>
  )
}
const Posts = (props) =>  {
  let posts = props.posts;
  console.log(posts);

  return (
    <div style={{display:"flex"}}>
      <div id="Posts">
        { Object.keys(posts).reverse().map(function(key) {
          return (
            <div key={key}  style={{paddingTop:"2em"}}>
              <Toast style={{minWidth:"50em"}}>

              <ToastHeader>
                <h5 style={{padding:'0.4em'}}><b>{ posts[key].title }</b></h5>
                <Badge color="dark">
                  @{ posts[key].author }
                </Badge>
                {'  '}
                <small style={{justifyContent:"right"}}>{posts[key].created ? 
                posts[key].created.slice(0,10) : null}</small>
              </ToastHeader>

              <ToastBody>
                <p>
                { posts[key].body }
                </p>
              </ToastBody>

              <ToastHeader>
                <Button color='link' style={{margin:'0', padding:'0'}}>
                  <Badge color="primary" pill >Like {posts[key].likes}</Badge>
                </Button> 
              </ToastHeader>

              <ToastHeader>
                <CreateComment 
                  username={props.username}
                  group_id={props.group_id}
                  cookies={props.cookies}
                  post_id={posts[key]._id}
                />
              </ToastHeader>
              </Toast>

            </div>
          );
        })}
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
    if (this.state.title === '') {
      this.setState({
        title_error: true,
        alertOpen: true
      })
    } else if (this.state.body === '') {
      this.setState({
        body_error: true,
        alertOpen: true
      })
      return;
    }
    let req_body = {
      'title':this.state.title, 
      'body': this.state.body,
      'author': this.props.username,
      'group_id': this.props.group_id }
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
        <Button onClick={this.toggle}>Create a Post</Button>
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
              <Button onClick={this.toggle}>Cancel</Button>
              <Button color="link" onClick={(e) => { this.submitForm(e)} }>Submit</Button>
            </Form>
          </ModalBody>
        </Modal>

      </div>
    );
  }
}



export {Posts, CreatePost};