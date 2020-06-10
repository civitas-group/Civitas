import React, { Component } from 'react';
import axios from 'axios';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      validUser: 0,
    }
  };
  async componentDidMount() {
    let token = localStorage.getItem('token');
    let fulltoken = 'Bearer ' + token;
    localStorage.setItem('token', token);
    console.log('home access fulltoken:', fulltoken)
    axios.post(
      'http://localhost:8080/api/authorize',
      { example: 'data' },
      { headers: { 'Content-Type': 'application/json', 
                   'authorization': fulltoken, 
                   'Access-Control-Allow-Origin': 'http://localhost:3000/*' } }
    ).then((response) => {
        console.log(response)
        let { validUser } = this.state;
        validUser = 1;
        this.setState({ validUser });
      })
      .catch((error) => {
        // Error
        console.log(error)
        if (error.response) {
            console.log('Request was made, server responded with status code outside 2xx', 
              error.response)
        } else if (error.request) {
            console.log('The request was made but no response was received', 
              error.request)
        } else {
            console.log('Error', error.message);
        }
        console.log("fulltoken", fulltoken);
      });
  }
  render() {
    return (
      
		  <h1>User is valid: {this.state.validUser}</h1>
    );
  }
}

export default Home;