import React, { Component } from 'react';
import AppNavbar from './components/AppNavbar';
import { Register } from './Register';
import Login from './Login';
import Home from './Home';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
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

function App() {
  return (
    <Router>
    <div className="App">
      <AppNavbar />
    </div>
    <div>
        <Switch>
            <Route exact path="/register" component={RegAdminCheck} />
            <Route exact path="/register/admin" render={(props) => <Register {...props} type="admin"/>} />
            <Route exact path="/register/regular" render={(props) => <Register {...props} type="regular"/>} />
            <Route exact path="/login" component={Login} />
			      <Route exact path="/home" component={Home} />
        </Switch>
    </div>
    </Router>
	
  );
}

export default App;
