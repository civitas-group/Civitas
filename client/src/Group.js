import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Redirect, withRouter } from 'react-router';
import Loading from './components/Loading'
import authorizeUser from './Auth'
import { Button, Jumbotron, Badge, Row, Col} from 'reactstrap';
import { CreatePost } from './Posts'
import Announcements, { CreateAnnouncement } from './Announcements';

class Group extends Component {
  state = {
      shown_posts: [],
      posts: [],
      announcements: [],
      redirect_to_root: false,
      group_name: "",
      group_id: "",
      post_body_error: false,
      post_title_error: false,
      can_show_more_posts: false
  };

  POST_PAGE_SIZE = 10;

  componentDidMount() {
    this.props.dispatch({ type: 'LOADING' });
    const { cookies } = this.props;
    let token = cookies.get('token');
    let endpoint = '/group/' + this.props.match.params.group_id;
    authorizeUser(token, endpoint)
      .then(result => {
        if (result){
          if (!result.data.group_ids.includes(this.props.match.params.group_id)
            && !result.data.managed_groups_ids.includes(this.props.match.params.group_id)){
            this.setState({redirect_to_root:true})
            return;
          }
          this.setState({
            shown_posts: result.data.posts.length > this.POST_PAGE_SIZE ? result.data.posts.slice(0, this.POST_PAGE_SIZE) : result.data.posts,
            posts: result.data.posts.length > this.POST_PAGE_SIZE ? result.data.posts.slice(this.POST_PAGE_SIZE) : [],
            can_show_more_posts: result.data.posts.length > this.POST_PAGE_SIZE ? true : false,
            announcements: result.data.announcements,
            group_name: result.data.group_name,
            group_id: this.props.match.params.group_id
          });
          delete result.data.posts;
          if (result.data.hasOwnProperty('announcements')) {
            delete result.data.announcements;
          }
          this.props.dispatch({
            type: 'GROUP_ACCESS',
            payload: Object.assign(result.data, {
              group_id: this.props.match.params.group_id
            })});
        }
        else {
          console.log('Error: no result on mount.')
          this.props.dispatch({ type: 'LOGOUT' });
        }
      })
      .catch(error => {
        console.log(error)
        try{
          if (error.response.data.error === "Invalid group"){
            this.setState({redirect_to_root:true})
          }
        }
        catch {
          this.props.dispatch({ type: 'LOGOUT' });
        }
        
      });
      console.log("MOUNTED STATE: ", this.state);
  }

  showMorePosts = () => {
    var new_shown_posts = [], new_posts = [];
    var new_can_show_more_posts;
    if (this.state.posts.length > this.POST_PAGE_SIZE) {
      new_shown_posts = this.state.shown_posts.concat(this.state.posts.slice(0, this.POST_PAGE_SIZE));
      new_posts = this.state.posts.slice(this.POST_PAGE_SIZE);
      new_can_show_more_posts = true;
    } else {
      new_shown_posts = this.state.shown_posts.concat(this.state.posts);
      new_posts = [];
      new_can_show_more_posts = false;
    }

    this.setState({
      shown_posts: new_shown_posts,
      posts: new_posts,
      can_show_more_posts: new_can_show_more_posts
    });
  }

  render() {
    if (this.props.loading){
      return (<Loading component="Group"/>);
    }
    else if (!this.props.logged_in || this.state.redirect_to_root){
      return (<Redirect to="/" />);
    }
    else {
      console.log("Announcements:", this.state.announcements)
      return (
        <div>
          <Jumbotron style={{paddingTop:'0'}}>
            <h1 className="display-5">{this.state.group_name}</h1>
            <p><Badge color="primary" pill>Private</Badge></p>
            <Announcements
              dispatch={this.props.dispatch}
              cookies={this.props.cookies}
              group_id= {this.props.match.params.group_id}
              is_supervisor={this.props.user_info.is_supervisor}
              announcements={this.state.announcements}/>
            <h4>Posts</h4>
            <Row style={{paddingLeft:'1em'}}>
            <CreatePost 
              is_request={false}
              group_id={this.state.group_id}
              username={this.props.user_info.username}
              cookies={this.props.cookies}/>
            <CreatePost 
              is_request={true}
              group_id={this.state.group_id}
              username={this.props.user_info.username}
              cookies={this.props.cookies}/>
            { this.props.user_info.is_supervisor ?
            <CreateAnnouncement group_id={this.state.group_id}
              username={this.props.user_info.username}
              cookies={this.props.cookies}/> : null }</Row>
            {this.props.children && React.cloneElement(this.props.children, {
              announcements: this.state.announcements,
              posts: this.state.shown_posts,
              group_id: this.props.match.params.group_id,
              username: this.props.user_info.username,
              cookies: this.props.cookies
            })}
          </Jumbotron>
          {this.state.can_show_more_posts ? 
            <div style={{display:'flex', justifyContent:'center', paddingTop:'0.5em', paddingBottom: '4em'}}>
              <Button color="light" size="sm" onClick={this.showMorePosts}>
                See More...
              </Button>
            </div>
            :
            <div style={{display:'flex', justifyContent:'center', paddingTop:'0.5em', paddingBottom: '4em'}}>
              <h4>No more posts to show!</h4>
            </div>
          }
          
        </div>
      );
    }
  }
}

const mapStateToProps = (state) => ({
    logged_in: state.logged_in,
    user_info: state.user_info,
    loading: state.loading,
    refetch_page: state.refetch_page
});
  
export default withRouter(connect(mapStateToProps)(Group));
