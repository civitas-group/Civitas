import React, { Component, useState } from 'react';
import { Button, Toast, ToastBody, ToastHeader, Badge, Collapse, 
  Modal, ModalHeader, ModalBody, Form, FormGroup,
  Input, Alert, ButtonGroup } from 'reactstrap';
import authorizeUser from './Auth';
import Comments, { CreateComment } from './Comments';
import { connect } from 'react-redux';
import { AiFillHeart, AiOutlineHeart, 
  AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { RiShoppingBasketLine,
  RiTimerLine } from 'react-icons/ri';
import { TiDelete } from 'react-icons/ti';
import { MdDone, MdMoreHoriz }from 'react-icons/md';
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
  const deletePost = (post_id) => {
    if (moreOptions) return;
    props.dispatch({ type: 'LOADING' });
    let token = props.cookies.get('token');
    let endpoint = '/posts';
    console.log('posts delete endpoint:', endpoint)
    authorizeUser(token, endpoint, 
      {group_id: props.group_id, 
      post_id: post_id}, 'delete')
      .then(result => {
        console.log("result delete post:",result)
        if (result){ window.location.reload(false); }
        else {
          console.log('Error: no result on deleting post.')
          props.dispatch({ type: 'LOGOUT' });
        }
      })
      .catch(error => {
        console.log(error)
        props.dispatch({ type: 'LOGOUT' });
      })
  }
  const resolvePost = (post_id) => {
    if (deleteConfirm) return;
    props.dispatch({ type: 'LOADING' });
    let token = props.cookies.get('token');
    let resolve_param;
    if (props.post.request_resolved) resolve_param = 'false';
    else resolve_param = 'true';
    let endpoint = '/posts/resolve?resolved=' + resolve_param;

    console.log('posts resolve (' + resolve_param  + 
      ') endpoint:', endpoint)
    authorizeUser(token, endpoint, 
      {post_id: post_id}, 'patch')
      .then(result => {
        console.log("result resolve post:",result)
        if (result){ window.location.reload(false);}
        else {
          console.log('Error: no result on resolving post.')
          props.dispatch({ type: 'LOGOUT' });
        }
      })
      .catch(error => {
        console.log(error)
        props.dispatch({ type: 'LOGOUT' });
      })
  }
  const [likeList, setLikeList] = useState(false);
  const toggleLikeList = () => {
    setLikeList(!likeList);
    console.log(props.post.like_ids)
  }
  const [submitting_like, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [moreOptions, setMoreOptions] = useState(false);
  const [unhide, setUnhide] = useState(false);

  return (
    <Toast style={{width:"50em", backgroundColor: (props.post.is_request && 
      props.post.request_resolved ? '#92E89C' : 'white')}}>
    <ToastHeader style={{backgroundColor:(props.post.is_request ? 
        (props.post.request_resolved ? "#92E89C" : "#2D70CE") 
        :"#FCFCFD")}}>
      <h5 style={{padding:'0.4em',margin:'0',}}>
      <b style={{color: (props.post.is_request ? 
        (props.post.request_resolved ? '#28A745' : 'white') : 'black' )}}>
        { props.post.title }</b>{' '}
      {props.post.is_request ? 
      <Badge pill 
      color={props.post.request_resolved ? "success": "warning"}>
      Request {' '}
      {props.post.request_resolved ? 
      <MdDone style={{paddingBottom:'0.2em'}}/> 
      : <RiTimerLine style={{paddingBottom:'0.2em'}}/>}
      </Badge>:null}

      {props.is_post_owner || props.is_supervisor ? 
      <Button style={{padding:'0', paddingBottom:'0.4em', 
      color:props.post.is_request ? 'white' : 'black'}} 
      onClick={()=>{setMoreOptions(!moreOptions)}}
      disabled={deleteConfirm} color="link"><MdMoreHoriz/>
      </Button>: null}

      {props.is_post_owner || props.is_supervisor ? 
      <Button onClick={()=>{setDeleteConfirm(!deleteConfirm)}} 
        disabled={moreOptions}
        style={{padding:'0',paddingBottom:'0.3em',
        color: props.post.is_request ? 'white':'#DC3545'}}
        size="lg" color="link"><TiDelete/></Button>: null}
      {props.post.is_request && props.post.request_resolved ? 
      <Button onClick={()=>{setUnhide(!unhide)}} 
        style={{padding:'0',paddingBottom:'0.3em',
        color: 'white'}} size="lg" color="link">
        {unhide ? <AiFillEyeInvisible/> : <AiFillEye/>}
      </Button>: null}

      {props.is_post_owner || props.is_supervisor ? 
      <Collapse isOpen={moreOptions || deleteConfirm}>
        
        <ButtonGroup size="sm">
        {deleteConfirm && !moreOptions ? 
        <Button size="sm" color="danger"
          onClick={()=>{deletePost(props.post._id)}}>
            {props.post.is_request ? 'Delete Request?' : 'Delete Post?'}
        </Button>
        :null}
        {moreOptions ? 
        (props.post.is_request ? /* Request options */
        
        (props.post.request_resolved ? 
        /* Request resolved options */
        <Button size="sm" onClick={()=>{resolvePost(props.post._id)}}
        color="warning">Unresolve</Button>
        : /* Request unresolved options */
        <Button size="sm" onClick={()=>{resolvePost(props.post._id)}}
        color="success">Resolve</Button>)

        : <Button size="sm" /* Regular Post options */
        color="primary">Add more options here</Button>) : null}
        </ButtonGroup>
      </Collapse>
      : null}

      </h5 >
      
      <Button color="link" style={{padding:'0'}}>
        <Badge color={(props.post.is_request ? 'light' : 'primary')}>
        @{ props.post.author }</Badge>
      </Button>
      {'  '}<div>
      <small style={{justifyContent:"right", marginTop:'1em',
      color: (props.post.is_request ? 'white' : 'black')}}>
        {props.post.created ? props.post.created.slice(0,10) 
        : null}</small></div>
    </ToastHeader>
    
    {props.post.is_request && props.post.request_resolved &&
     !unhide ? null :
    <div>
      <ToastBody style={{backgroundColor: 
        props.post.is_request && props.post.request_resolved ? 
        '#70C182': 'white'}}>
        <p>{ props.post.body }</p>
      </ToastBody>
      <ToastHeader style={{backgroundColor: 
        props.post.is_request && props.post.request_resolved ? 
        '#70C182': 'white'}}>
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
        <Button disabled={submitting_like || 
          (props.post.is_request && props.post.request_resolved)} 
          onClick={toggleLike} color='link' size="sm">
          {liked ? ' Unlike' : ' Like'}
        </Button>
      </ToastHeader>
      <ToastBody style={{backgroundColor: 
        props.post.is_request && props.post.request_resolved ? 
        '#70C182': 'white'}}>
        {props.children && React.cloneElement(props.children, {
          force_disable: props.post.is_request && props.post.request_resolved,
          group_id: props.group_id,
          post_id: props.post._id,
          username: props.username,
          cookies: props.cookies,
          is_post_owner: props.is_post_owner,
          is_supervisor: props.is_supervisor
        })}

      </ToastBody>
      {props.post.is_request && props.post.request_resolved ? null :
      <div style={{paddingLeft:'1em', paddingRight:'1em'}}>
        <CreateComment 
          username={props.username}
          group_id={props.group_id}
          cookies={props.cookies}
          post_id={props.post._id}
          post_owner={props.post.author}/>
      </div>}
    </div>}
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
                is_supervisor={props.user_info.is_supervisor}
                is_post_owner={props.username === posts[key].author}
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
      body: "",
      title_text: this.props.is_request ? 'Request Title' : 'Title',
      body_text: this.props.is_request ? 'Request Body' : 'Body',
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
      'group_id': this.props.group_id,
      'is_request': this.props.is_request
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
      <div style={{paddingLeft: this.props.is_request ? '0.5em' :'0'}}> 
        <Button outline={this.props.is_request} color="primary" onClick={this.toggle} >
          {this.props.is_request ? 'Make Request' :'Create Post'} {' '}
          {this.props.is_request ? <RiShoppingBasketLine/> : null}
          </Button>
        <Modal isOpen={this.state.modal} toggle={this.toggle} style={{opacity:"0.9"}}>
          <ModalHeader toggle={this.toggle}>
          {this.props.is_request ? <Badge color="primary">
          Make a Request <RiShoppingBasketLine/></Badge> :'Create a Post'}
          
          </ModalHeader>
          <ModalBody>
            <Alert isOpen={this.state.title_error && this.state.alertOpen}
                toggle={this.DismissAlert} color="danger">
              Title and Body must not be empty
            </Alert>
            <Form onSubmit={(e) => this.submitForm(e)}>
              <FormGroup>
                <Input 
                  type="text" name="title" id="title" 
                  placeholder={this.state.title_text}
                  onChange={(e) => { this.handleChange(e);}}/>
              </FormGroup>
              <FormGroup >
                <Input 
                  type="textarea" name="body" id="body" 
                  placeholder={this.state.body_text}
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