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
    await authorizeUser(token)
      .then(result => {
        console.log(result)
        if (result){
          this.setState({ userInfo: result.data });      
        }
      })
      .catch(error => {
        this.setState({ signOut: true });  
      })
    await new Promise(resolve => setTimeout(resolve, 1000));
    //this.setState({justLoggedIn:false})
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
      this.props.dispatch({ type: 'LOGOUT' });
      return (<Redirect to="/" />);
    }
    
    return (
      <div>
      
		  <h4>Username: {this.state.userInfo.username}</h4>
      <h4>Email: {this.state.userInfo.email}</h4>
      <h4>Is supervisor?: {this.state.userInfo.is_supervisor ? <p>Yes</p> : <p>No</p> }</h4>
      <UserTypeSpecific is_supervisor={this.state.userInfo.is_supervisor}/>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  logged_in: state.logged_in
});
export default connect(mapStateToProps)(Home);