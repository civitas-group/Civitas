import React, { Component, useState, updateState, useEffect } from 'react';
import { Button, Toast, ToastBody, ToastHeader, 
  Badge, Collapse, Modal, ModalHeader, ModalBody, 
  ModalFooter, ButtonGroup, Row, Col } from 'reactstrap';
import authorizeUser from './Auth';
import Comments, { CreateComment } from './Comments';
import { connect } from 'react-redux';
import { AiFillHeart, AiOutlineHeart, AiOutlineStop,
  AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import { RiTimerLine } from 'react-icons/ri';
import { TiDelete } from 'react-icons/ti';
import { MdDone, MdMoreHoriz }from 'react-icons/md';
import './css/Posts.css';
import CivitasLogoSmall from './img/CivitasLogoSmall.png';
import CivitasLogoSmallWhite from './img/CivitasLogoSmallWhite.png';
import { IoIosCheckmarkCircle } from 'react-icons/io';

function EmptyPosts(){
  return(
    <h5 style={{color:'grey'}}>No posts found.</h5>
  )
}

class ResolveModal extends Component {
  constructor(props){
    super(props);
    this.state = {
      show_users: false,
      chosenResolvers: [],
      chosenResolversRatings: []
    }
    this.toggleChooseResolver = this.toggleChooseResolver.bind(this);
    this.chooseResolverRating = this.chooseResolverRating.bind(this);
  }

  toggleChooseResolver = async (index) => {
    if (this.state.chosenResolvers.length !== 
      (Object.keys(this.props.group_users_map)).length){
        await this.setState({
          chosenResolvers: Array.from({
            length: (Object.keys(this.props.group_users_map)).length
          }).map(x => false)
        })

        await this.setState({
          chosenResolversRatings: Array.from({
            length: (Object.keys(this.props.group_users_map)).length
          }).map(x => 5)
        })
      }
    let tempChosenResolvers = this.state.chosenResolvers;
    tempChosenResolvers[index] = !tempChosenResolvers[index];
    await this.setState({
      chosenResolvers: tempChosenResolvers
    })
  }
  chooseResolverRating = async (index, rating) => {
    let tempChosenResolverRatings = this.state.chosenResolversRatings;
    tempChosenResolverRatings[index] = rating;
    console.log(tempChosenResolverRatings)
    await this.setState({
      chosenResolversRatings: tempChosenResolverRatings
    })
  } 

  resolveRequest = (post_id) => {
    if (this.props.deleteConfirm) return;
    //console.log(this.state.chosenResolvers, this.state.chosenResolversRatings)
    let resolvers_ids = []
    let resolvers_usernames = []
    let ratings = []
    if (this.state.show_users){
      for (let i = 0; i < Object.keys(this.props.group_users_map).length; ++i){
        //console.log(Object.keys(this.props.group_users_map)[i])
        if (this.state.chosenResolvers[i]){
          resolvers_usernames.push(Object.keys(this.props.group_users_map)[i])
          resolvers_ids.push(
            this.props.group_users_map[Object.keys(this.props.group_users_map)[i]].id
          )
          ratings.push(this.state.chosenResolversRatings[i])
        }
      }
    }


    this.props.dispatch({ type: 'LOADING' });
    let token = this.props.cookies.get('token');
    let endpoint = '/posts/change_status?status=resolved';

    console.log('post resolved endpoint:', 
      endpoint)
    let req_body = {
      'post_id': post_id,
      'group_id': this.props.group_id,
      'resolvers_ids': resolvers_ids,
      'resolvers_usernames': resolvers_usernames,
      'ratings': ratings
    }
    authorizeUser(token, endpoint, req_body, 'patch')
      .then(result => {
        console.log("result resolved post:",result)
        if (result){ window.location.reload(false);}
        else {
          console.log('Error: no result on resolving request.')
          this.props.dispatch({ type: 'LOGOUT' });
        }
      })
      .catch(error => {
        console.log(error)
        this.props.dispatch({ type: 'LOGOUT' });
      })
  }
  render(){
    return (
      <div>
      <ModalHeader>
        <div style={{paddingBottom:'0.5em'}}>
          Did anyone help resolve this request?
        </div>
        <ButtonGroup>
          <Button color="primary" outline={!this.state.show_users}
            onClick={()=>{
              this.setState({
                show_users: !this.state.show_users
              })
            }}>
            Select Helpers
          </Button>
          <Button color="success" onClick={()=>{
            this.resolveRequest(this.props.post_id)
            }}>
            {this.state.show_users ? 'Selected, ' : 'No, '} 
            Mark as Resolved
          </Button>
        </ButtonGroup>
      </ModalHeader>
      <ModalBody>

        <Collapse isOpen={this.state.show_users}>
        <ButtonGroup vertical>
          {Object.keys(Object.keys(this.props.group_users_map))
            .map(function(key){
              //{(Object.keys(props.group_users_map))[key]}
              if ((Object.keys(this.props.group_users_map))[key] 
                === this.props.username){
                return (null);
              }
                
              return (
                <div key={key}>
                <Button style={{display:'flex', justifyContent:'left',
                  color: this.state.chosenResolvers[key] ? '#007BFF'
                    : 'black'}}
                  color={this.state.chosenResolvers[key] ? "link" : "link"} 
                  size="sm"
                  onClick={()=>{this.toggleChooseResolver(key)}}>
                  {(Object.keys(this.props.group_users_map))[key]}
                  {this.state.chosenResolvers[key] ? 
                    <IoIosCheckmarkCircle 
                      style={{marginTop: '0.35em', 
                        marginLeft:'0.2em'}}/> 
                      : null }
                </Button>

                <Collapse isOpen={this.state.chosenResolvers[key]}
                  style={{paddingLeft: '0.7em'}}>
                  <span style={{color:'#007BFF', fontSize:'14px'}}>
                    Rating:{' '}</span>
                  <ButtonGroup>
                   
                  <Button color={this.state.chosenResolversRatings[key] >= 1 ?
                    "primary":"link"} size="sm"
                    onClick={()=>{this.chooseResolverRating(key, 1)}}>
                    <img src={this.state.chosenResolversRatings[key] >= 1 ?
                      CivitasLogoSmallWhite : CivitasLogoSmall} 
                      width='10em'/>
                  </Button>
                  
                  <Button color={this.state.chosenResolversRatings[key] >= 2 ?
                    "primary":"link"} size="sm"
                    onClick={()=>{this.chooseResolverRating(key, 2)}}>
                    <img src={this.state.chosenResolversRatings[key] >= 2 ?
                      CivitasLogoSmallWhite :CivitasLogoSmall} 
                      width='10em'/>
                  </Button>

                  <Button color={this.state.chosenResolversRatings[key] >= 3 ?
                    "primary":"link"} size="sm"
                    onClick={()=>{this.chooseResolverRating(key, 3)}}>
                    <img src={this.state.chosenResolversRatings[key] >= 3 ?
                      CivitasLogoSmallWhite :CivitasLogoSmall} 
                      width='10em'/>
                  </Button>

                  <Button color={this.state.chosenResolversRatings[key] >= 4 ?
                    "primary":"link"} size="sm"
                    onClick={()=>{this.chooseResolverRating(key, 4)}}>
                    <img src={this.state.chosenResolversRatings[key] >= 4 ?
                      CivitasLogoSmallWhite :CivitasLogoSmall} 
                      width='10em'/>
                  </Button>

                  <Button color={this.state.chosenResolversRatings[key] == 5 ?
                    "primary":"link"} size="sm"
                    onClick={()=>{this.chooseResolverRating(key, 5)}}>
                    <img src={this.state.chosenResolversRatings[key] == 5 ?
                      CivitasLogoSmallWhite :CivitasLogoSmall} 
                      width='10em'/>
                  </Button>
                  <Button 
                    color={this.state.chosenResolversRatings[key] >= 4 ?
                    "success":
                    this.state.chosenResolversRatings[key] >= 2 ?
                    "warning" : "danger"} size="sm"
                    onClick={()=>{
                      this.state.chosenResolversRatings[key] == 5 ?
                      this.chooseResolverRating(key, 1) 
                      : this.chooseResolverRating(key, 
                      (this.state.chosenResolversRatings[key] + 1)
                      )
                    }}
                    >
                    {this.state.chosenResolversRatings[key]}
                  </Button>

                  </ButtonGroup>

                </Collapse> 
                </div>
              );
          }.bind(this))}
        </ButtonGroup>
        </Collapse>
      </ModalBody>
    </div>
    )
  }
}

const Post = (props) => {
  // if post: status is post
  // if request: status can be: open, closed, resolved
  const status = props.post.is_request ? props.post.request_status : 'post';
  const toastBGColor = 
    props.post.is_request ? 
      props.post.request_status  === 'open' ? 'white'
      : props.post.request_status === 'resolved' ? '#92E89C'
      : '#D60606'
    : 'white';
  const titleToastHeaderBGColor = 
    props.post.is_request ? 
      props.post.request_status  === 'open' ? '#2D70CE'
      : props.post.request_status === 'resolved' ? '#92E89C'
      : '#D60606'
    : '#FCFCFD';
  const requestBadgeColor =
    props.post.is_request ? 
      props.post.request_status  === 'open' ? 'warning'
      : props.post.request_status === 'resolved' ? 'success'
      : 'danger'
    :'warning';
  const authorBadgeColor =
    props.post.is_request ? 
      props.post.request_status  === 'open' ? 'light'
      : props.post.request_status === 'resolved' ? 'success'
      : 'danger'
    : 'primary';
  const titleColor =
    props.post.is_request ? 
      props.post.request_status  === 'open' ? 'white'
      : props.post.request_status === 'resolved' ? '#28A745'
      : '#3F0F14'
    : 'black';
  const bodyToastBGColor =
    props.post.is_request ? 
      props.post.request_status  === 'open' ? 'white'
      : props.post.request_status === 'resolved' ? '#70C182'
      : '#C1303E'
    :'white';

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
    let req_body = {
      'post_id': post_id,
      'group_id': props.group_id,
      'resolvers_ids': [],
      'resolvers_usernames': [],
      'ratings': []
    }
    authorizeUser(token, endpoint, req_body, 'patch')
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
  const [resolveModal, setResolveModal] = useState(false);
  const toggleResolveModal = async () => {
    setResolveModal(!resolveModal);
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
      <Badge pill  color={requestBadgeColor}>
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
      <Button style={{padding:'0', paddingBottom:'0.4em', 
      color:props.post.is_request ? 'white' : 'black'}} 
      onClick={()=>{setMoreOptions(!moreOptions)}}
      disabled={deleteConfirm} color="link"><MdMoreHoriz/>
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
        //changeRequestStatus(props.post._id, 'resolved')}}
        <Button size="sm" onClick={toggleResolveModal}
          color="success">Resolve</Button> : null }
        {moreOptions && status === 'open' ? 
        <Button size="sm" onClick={()=>{
          changeRequestStatus(props.post._id, 'closed')}}
        color="danger">Close</Button> : null}
        </ButtonGroup>
      </Collapse>
      : null}

      </h5 >
      <div>
        <Button color="link" style={{padding:'0'}}>
          {Object.keys(props.post.tags_info).map(function(key) {
            return (
              <Badge key={key} color="info" style={{margin:'0.1em'}}>
                {props.post.tags_info[key].tag_name}
              </Badge>
            );
          })}
        </Button>
      </div>
      <Button color="link" style={{padding:'0'}}>
        <Badge color={authorBadgeColor}>
        @{ props.post.author } {' '}
        {props.group_users_loading ? null :
          
          <Badge pill color={(props.post.is_request ? 'primary' : 'light')}
            style={{marginTop:'0.2em'}}>
            <span style={{color:props.post.is_request ? 'white':'#007BFF'}}>
            { typeof (props.group_users_map) !== 'object' ? null 
              : props.group_users_map[props.post.author].total_points ?
              props.group_users_map[props.post.author].total_points
              : 0
            }
            </span>
            
            <img src={props.post.is_request ? 
                CivitasLogoSmallWhite : CivitasLogoSmall } 
              width='10em'style={{marginBottom:'0.15em'}}/>
          </Badge>
        }
        </Badge>

      </Button>
      {'  '}


      <div>
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
        <Modal isOpen={resolveModal} toggle={toggleResolveModal}>
          <ResolveModal username={props.username}
            group_users_map={props.group_users_map}
            group_users_loading={props.group_users_loading}
            title={props.post.title}
            post_id={props.post._id}
            group_id={props.group_id}
            deleteConfirm={deleteConfirm}
            cookies={props.cookies}
            dispatch={props.dispatch}/>
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
  console.log(props.group_users_map)
  if (Object.keys(props.user_info).length === 0){
    return (null)
  }
  return (
    <div style={{display:"flex"}}>
      <div id="Posts">
        { Object.keys(posts).map(function(key) {
          return (
            <div key={key} style={{paddingTop:"2em"}}>
              <Post email={props.user_info.email}
                is_supervisor={props.user_info.is_supervisor}
                is_post_owner={props.username === posts[key].author}
                post={posts[key]}
                cookies={props.cookies}
                dispatch={props.dispatch}
                group_id={props.group_id}
                username={props.username}
                group_users_map={props.group_users_map}
                group_users_loading={props.group_users_loading}
                >
                  <Comments cookies={props.cookies}/>
              </Post>
            </div>
          );
        }.bind(this))}
        { Object.keys(props.posts).length === 0 ? <EmptyPosts />: null}
      </div>
    </div>
  );
}


const mapStateToProps = (state) => ({
  user_info: state.user_info,
  group_users_map: state.group_users_map,
  group_users_loading: state.group_users_loading
});

export default connect(mapStateToProps, null)(Posts);