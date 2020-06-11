import React, { Component } from 'react';
import authorizeUser from './Auth'
import { Redirect } from 'react-router';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      signOut: false,
      userInfo: {}
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

  }
  render() {
    const { cookies } = this.props;
    console.log("cookies:", cookies.get('token'));
    console.log(this.state.userInfo)
    if (this.state.signOut === true){
      return (<Redirect to="/" />);
    }
    //cookies.set('toke', 'Ross', { path: '/', sameSite: true,});
    //console.log("cookies1:", cookies.get('name'));
    
    return (
      <div>
      <button onClick={() => {cookies.remove('token'); 
        this.setState({ signOut: true });}}>Logout</button>
		  <h4>Username: {this.state.userInfo.username}</h4>
      <h4>Email: {this.state.userInfo.email}</h4>
      <h4>Is supervisor?: {this.state.userInfo.is_supervisor ? <p>Yes</p> : <p>No</p> }</h4>
      </div>
    );
  }
}

export default Home;