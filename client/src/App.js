import React from 'react';
import AppNavbar from './components/AppNavbar';
import Register from './Register';
import Login from './Login';
import Home from './Home';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css';


function App() {
  return (
    <Router>
    <div className="App">
      <AppNavbar />
    </div>
    <div>
        <Switch>
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={Login} />
			<Route exact path="/home" component={Home} />
        </Switch>
    </div>
    </Router>
	
  );
}

export default App;
