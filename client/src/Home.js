import React, { Component } from 'react';
import { Button, Spinner, NavLink } from 'reactstrap';
import authorizeUser from './Auth'
import { Redirect } from 'react-router';
import { connect } from 'react-redux'

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signOut: false,
      userInfo: {},
      loadingUserInfo: true,
      justLoggedIn: true
    }
  };
  async componentDidMount() {
    const { cookies } = this.props;
    let token = cookies.get('token');
    await authorizeUser(token, 'authorize')
      .then(result => {
        console.log("result:",result)
        if (result){
          this.props.dispatch({ 
            type: 'HOMEPAGE_ACCESS',
            payload: result.data }); 
        }
      })
      .catch(error => {
        console.log(error)
        this.props.dispatch({ type: 'LOGOUT' });
      })
  }

  render() {
    const { cookies } = this.props;
    console.log("home cookies:", cookies.get('token'),
    this.props.logged_in);

    function UserTypeSpecific(props) {
      if (props.info.is_supervisor) {    
        if ('managed_groups_ids' in props.info){
          if (props.info['managed_groups_ids'].length === 0){
            return (<Button href="/creategroup">
              Create Group as Admin</Button>)           
          }
          else {
            return (
            <div>
              <h1>Your administered groups:</h1>
              <Button href="/group">
              {props.info['managed_groups_ids'][0]}</Button>
            </div>)
          }
        }
        return (<Button href="/creategroup">
                Create Group as Admin</Button>)  
      } 
      else {
        if ('group_ids' in props.info){
          if (props.info['group_ids'].length === 0){
            return (<Button href="/joingroup">Join Group</Button>)          
          }
          else {
            return (
            <div>
              <h1>Your groups:</h1>
              <Button href="/group">
                {props.info['group_ids'][0]}</Button>
            </div>)
          }
        }
        return (<Button href="/joingroup">Join Group</Button>)  
      }
    }

    if (!this.props.logged_in){
      return (<Redirect to="/" />);
    }

    return (
      <div>
		  <h4>Username: {this.props.userInfo.username}</h4>
      <h4>Email: {this.props.userInfo.email}</h4>
      <h4>Is supervisor?: {this.props.userInfo.is_supervisor ? 
        <p>Yes</p> : <p>No</p> }</h4>
      
      <h4>{'group_ids' || 'managed_group_ids' in this.props.userInfo ? 
        <UserTypeSpecific info={this.props.userInfo}/> : null}</h4>

      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  logged_in: state.logged_in,
  userInfo: state.userInfo
});
export default connect(mapStateToProps)(Home);