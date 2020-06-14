import React, { Component } from 'react';
import { connect } from 'react-redux'
import { withCookies } from 'react-cookie';
import AppNavbar from './components/AppNavbar';
import Home from './Home';
import Group from './Group';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css';

class App extends Component {
  render() {
    return (

      <div> 
      <Router>
      <div className="App">
        <AppNavbar cookies={this.props.cookies}/>
      </div>
      <div>
          <Switch>
              <Route exact path="/home" 
                render={() => (<Home cookies={this.props.cookies}/>)} />
          <Route exact path="/group" 
                    render={() => (<Group cookies={this.props.cookies}/>)} />
          <Route exact path="/joingroup" 
                    render={() => (<Group cookies={this.props.cookies}/>)} />
          </Switch>
      </div>
      </Router>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => ({
  cookies: ownProps.cookies,
});

//export default connect(mapStateToProps)(App);
export default withCookies(connect(mapStateToProps, null)(App));
