import React, { Component } from 'react';
import { connect } from 'react-redux'
import { withCookies } from 'react-cookie';
import AppNavbar from './components/AppNavbar';
import Register from './Register';
import Login from './Login';
import Home from './Home';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css';

class RegAdminCheck extends Component {

  render() {

    return ( 
      <div>
        <div>
        <a href="/register/admin">Register as Administrator</a>
        </div>
        <div>
        <a href="/register/regular">Register as Regular User</a>
        </div>
      </div>
    )
  }
}

class App extends Component {
  render() {
  return (
    <Router>
    <div className="App">
      <AppNavbar cookies={this.props.cookies}/>
    </div>
    <div>
        <Switch>
            <Route exact path="/register" component={RegAdminCheck} />
            <Route exact path="/register/admin" 
              render={() => (<Register usertype="admin" 
              cookies={this.props.cookies} />)} />
            <Route exact path="/register/regular" 
              render={() => (<Register usertype="regular" 
              cookies={this.props.cookies}/>)} />
            <Route exact path="/login" component={Login} />
            <Route exact path="/home" 
              render={() => (<Home cookies={this.props.cookies}/>)}
              />
        </Switch>
    </div>
    </Router>
	
  );
  }
}

const mapStateToProps = (state, ownProps) => ({
  count: state,
  cookies: ownProps.cookies,
});

//export default connect(mapStateToProps)(App);
export default withCookies(connect(mapStateToProps, null)(App));
