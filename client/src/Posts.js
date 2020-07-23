import React, { Component, useState, useEffect } from 'react';
import { Button, Toast, ToastBody, ToastHeader, Badge, Collapse, 
  Modal, ModalHeader, ModalBody, Form, FormGroup,
  Input, Alert, ButtonGroup } from 'reactstrap';
import authorizeUser from './Auth';
import Comments, { CreateComment } from './Comments';
import { connect } from 'react-redux';
import { AiFillHeart, AiOutlineHeart, AiOutlineStop,
  AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { RiTimerLine } from 'react-icons/ri';
import { TiDelete } from 'react-icons/ti';
import { MdDone, MdMoreHoriz }from 'react-icons/md';
import './css/Posts.css';

function EmptyPosts(){
  return(
    <h5 style={{color:'grey'}}>No posts made yet.</h5>
  )
}

const Post = (props) => {

  // if post: status is post
  // if request: status can be: open, closed, resolved
  const [status, setStatus] = useState('post');
  const [toastBGColor, setToastBGColor] = useState('white');
  const [titleToastHeaderBGColor, setTitleToastHeaderBGColor] 
    = useState('#FCFCFD');
  const [badgeColor, setBadgeColor] = useState('warning');
  const [titleColor, setTitleColor] = useState('black');
  const [bodyToastBGColor, setBodyToastBGColor] = useState('white');
  useEffect(() => {
    if(props.post.is_request){
      setStatus(props.post.request_status)
      if (props.post.request_status === 'open'){
        setBadgeColor('warning');
        setToastBGColor('white');
        setTitleToastHeaderBGColor('#2D70CE');
        setTitleColor('white');
      } else if (props.post.request_status === 'resolved'){
        setBadgeColor('success');
        setToastBGColor('#92E89C');
        setTitleToastHeaderBGColor('#92E89C');
        setTitleColor('#28A745');
        setBodyToastBGColor('#70C182');
      } else if (props.post.request_status === 'closed'){
        setBadgeColor('danger');
        setToastBGColor('#D60606');
        setTitleToastHeaderBGColor('#D60606');
        setTitleColor('#3F0F14');
        setBodyToastBGColor('#C1303E');
      }
    }
  });

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
  const changeRequestStatus = (post_id, status_param) => {
    if (deleteConfirm) return;
    props.dispatch({ type: 'LOADING' });
    let token = props.cookies.get('token');
    let endpoint = '/posts/change_status?status=' + status_param;

    console.log('posts change_status (' + status_param  + ') endpoint:', 
      endpoint)
    authorizeUser(token, endpoint, 
      {post_id: post_id}, 'patch')
      .then(result => {
        console.log("result resolve post:",result)
        if (result){ window.location.reload(false);}
        else {
          console.log('Error: no result on changing request.')
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
    <Toast style={{width:"50em", backgroundColor: toastBGColor}}>
    <ToastHeader style={{backgroundColor: titleToastHeaderBGColor }}>
      <h5 style={{padding:'0.4em',margin:'0'}}>
      <b style={{color: titleColor}}>
        { props.post.title }</b>{' '}
      {props.post.is_request ? 
      <Badge pill  color={badgeColor}>
      Request {' '}
      {status === 'closed' ? <AiOutlineStop/> :
      status === 'resolved' ? 
      <MdDone style={{paddingBottom:'0.2em'}}/> 
      : props.post.is_timed ? 
      <RiTimerLine style={{paddingBottom:'0.2em'}}/>
      : null}
      {status === 'closed' || status === 'open' ? 
      <a style={{fontSize:'11px'}}>
      {props.post.is_timed && !props.post.timed_request_info.expired ?
        props.post.timed_request_info.time_left : null }</a>
      : null}
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
      {status === 'resolved' || status === 'closed'? 
      <Button onClick={()=>{setUnhide(!unhide)}} 
        style={{padding:'0',paddingBottom:'0.3em',
        color: 'white'}} size="lg" color="link">
        {unhide ? <AiFillEye/> : <AiFillEyeInvisible/>}
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
        
        (status === 'resolved' || status === 'closed' ? 

        <Button size="sm" 
        disabled={props.post.hasOwnProperty('timed_request_info') ? 
        props.post.timed_request_info.expired ? true : false : false}
          onClick={()=>{
          changeRequestStatus(props.post._id, 'open')}}
        color="warning">
        {props.post.hasOwnProperty('timed_request_info') ?
          props.post.timed_request_info.expired ? 
          'You cannot reopen an expired request.' : 'Reopen': 'Reopen'}
        </Button>
        : null)
        : <Button size="sm" /* Regular Post options */
        color="primary">Add more options here</Button>) : null}
        {moreOptions && status === 'open' ? 
        <Button size="sm" onClick={()=>{
          changeRequestStatus(props.post._id, 'resolved')}}
        color="success">Resolve</Button> : null }
        {moreOptions && status === 'open' ? 
        <Button size="sm" onClick={()=>{
          changeRequestStatus(props.post._id, 'closed')}}
        color="danger">Close</Button> : null}
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
    
    {(status === 'resolved' || status === 'closed') && !unhide ? null :
    <div>
      <ToastBody style={{backgroundColor: bodyToastBGColor}}>
        <p>{ props.post.body }</p>
      </ToastBody>
      <ToastHeader style={{backgroundColor: bodyToastBGColor}}>
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
          status === 'resolved' || status === 'closed'} 
          onClick={toggleLike} color='link' size="sm">
          {liked ? ' Unlike' : ' Like'}
        </Button>
      </ToastHeader>
      { props.post.comment_ids.length !== 0 || 
      (status !== 'resolved' && status !== 'closed')  ?
      <ToastBody style={{backgroundColor: bodyToastBGColor}}>
        {props.children && React.cloneElement(props.children, {
          force_disable: status === 'resolved' || status === 'closed',
          group_id: props.group_id,
          post_id: props.post._id,
          username: props.username,
          cookies: props.cookies,
          is_post_owner: props.is_post_owner,
          is_supervisor: props.is_supervisor
        })}

      </ToastBody> : null}
      {status === 'resolved' || status === 'closed' ? null :
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
        { Object.keys(posts).map(function(key) {
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


const mapStateToProps = (state) => ({
  user_info: state.user_info,
});

export default connect(mapStateToProps, null)(Posts);