import React, { Component } from 'react';
import { Button } from 'reactstrap';
import authorizeUser from './Auth'
import { Redirect } from 'react-router';
import { connect } from 'react-redux'

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signOut: false,
      userInfo: {},
      justLoggedIn: true
    }
  };
  async componentDidMount() {
    const { cookies } = this.props;
    let token = cookies.get('token');
    await authorizeUser(token, 'authorize')
      .then(result => {
        console.log(result)
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
    function UserTypeSpecific(props) {
      if (props.is_supervisor) {    
        return (
          <Button>
            Create Group as Admin
          </Button>)
      } else {
        return (
          <Button>
            Join Group
          </Button>)
      }
    }
    const { cookies } = this.props;
    console.log("cookies:", cookies.get('token'));
    console.log(this.state.userInfo)
    if (!this.props.logged_in){
      return (<Redirect to="/" />);
    }
    
    return (
      <div>
		  <h4>Username: {this.props.userInfo.username}</h4>
      <h4>Email: {this.props.userInfo.email}</h4>
      <h4>Is supervisor?: {this.props.userInfo.is_supervisor ? <p>Yes</p> : <p>No</p> }</h4>
      <UserTypeSpecific is_supervisor={this.props.userInfo.is_supervisor}/>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  logged_in: state.logged_in,
  userInfo: state.userInfo
});
export default connect(mapStateToProps)(Home);