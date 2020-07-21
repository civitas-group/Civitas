import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Redirect, withRouter } from 'react-router';
import Loading from './components/Loading'
import authorizeUser from './Auth'
import { Jumbotron, Badge, Row, Col} from 'reactstrap';
import { CreatePost } from './Posts'
import Announcements, { CreateAnnouncement } from './Announcements';

class Group extends Component {
  state = {
    posts: [],
    announcements: [],
    redirect_to_root: false,
    group_name: "",
    group_id: "",
    post_body_error: false,
    post_title_error: false
  };
  componentDidMount() {
    console.log('Group mount')
    this.props.dispatch({ type: 'LOADING' });
    const { cookies } = this.props;
    let token = cookies.get('token');
    let endpoint = '/group/' + this.props.match.params.group_id;
    console.log('group check endpoint:', endpoint)
    authorizeUser(token, endpoint)
      .then(result => {
        console.log("result group:",result)
        if (result){
          if (!result.data.group_ids.includes(this.props.match.params.group_id)
            && !result.data.managed_groups_ids.includes(this.props.match.params.group_id)){
            this.setState({redirect_to_root:true})
            return;
          }
          this.setState({posts: result.data.posts,
                        announcements: result.data.announcements,
                        group_name: result.data.group_name,
                        group_id: this.props.match.params.group_id})
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
        
      })
  }

  render() {

    console.log(this.props.loading, this.props.logged_in)
    console.log("token group",
    this.props.cookies.get('token'), this.props.logged_in)

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
              posts: this.state.posts,
              group_id: this.props.match.params.group_id,
              username: this.props.user_info.username,
              cookies: this.props.cookies
            })}
          </Jumbotron>
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
