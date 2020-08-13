import React, { Component } from 'react';
import { connect } from 'react-redux'
import { withCookies } from 'react-cookie';
import AppNavbar from './components/AppNavbar';
import Home from './Home';
import PublicHome from './PublicHome';
import Group from './Group';
import Posts from './Posts';
import AdminConsole from './AdminConsole';
import SuperAdminConsole from './SuperAdminConsole/SuperAdminConsole';
import CreateGroup from './CreateGroup';
import PageNotFound from './PageNotFound';
import AccountDeleted from './AccountDeleted';
import Notifications from './Notifications';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import './css/App.css';
import authorizeUser from './Auth';
import UserProfile from './UserProfile';

class App extends Component {
  async componentDidMount() {
    this.props.dispatch({ type: 'LOADING' });
    const { cookies } = this.props;
    let token = cookies.get('token');
    await authorizeUser(token, '/authorize')
      .then(result => {
        console.log("result:",result)
        if (result){
          if (!this.logged_in){
            this.props.dispatch({ type: 'LOGIN' });
          }
        }
        else {
          console.log('Error: no result on mount.')
          this.props.dispatch({ type: 'LOGOUT' });
        }
      })
      .catch(error => {
        console.log(error)
        this.props.dispatch({ type: 'LOGOUT' });
      })
  }

  render() {
    return (
      <div className="Main-div"> 
      <Router>
      <AppNavbar cookies={this.props.cookies}/>
      <Switch>
        <Route exact path="/">{() => (<PublicHome cookies={this.props.cookies}/>)}</Route>
        <Route exact path="/groups">{() => (<Home cookies={this.props.cookies}/>)}</Route>
        <Route exact path="/groups/:group_id" >
          <Group cookies={this.props.cookies}>
            <Posts cookies={this.props.cookies}/>
          </Group>
        </Route>
        <Route exact path="/groups/:group_id/console">
          <AdminConsole cookies={this.props.cookies}/>
        </Route>
        <Route exact path="/joingroup"
          render={() => (<Group cookies={this.props.cookies}/>)} />
        <Route exact path="/creategroup"
          render={() => (<CreateGroup cookies={this.props.cookies}/>)} />
        <Route exact path="/notifications"
          render={() => (<Notifications cookies={this.props.cookies}/>)} />
        <Route exact path="/superadminconsole">
          <SuperAdminConsole cookies={this.props.cookies}/>
        </Route>
        <Route exact path="/user-profile">
          <UserProfile cookies={this.props.cookies}/>
        </Route>
        <Route exact path="/account-deleted">
          <AccountDeleted/>
        </Route>
        <Route component={PageNotFound}/>
      </Switch>
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
