import React, { Component, useState } from 'react';
import authorizeUser from '../Auth'
import { Redirect, withRouter} from 'react-router';
import { connect } from 'react-redux'
import Loading from '../components/Loading'
import AdminsListGroup from './AdminsListGroup';
import { Jumbotron, Button, Badge, ButtonGroup } from 'reactstrap';

class SuperAdminConsole extends Component {
  constructor(props){
    super(props);
    this.state = {
      loading_admins: true,
      admins: [],
      show_admins: true,
    }
  }
  componentDidMount() {
    console.log('super admin console mounted')
    this.props.dispatch({ type: 'LOADING' });
    const { cookies } = this.props;
    let token = cookies.get('token');
    
    authorizeUser(token, '/authorize')
      .then(result => {
        console.log("result super admin console:",result)
        if (result){

          this.props.dispatch({ 
            type: 'HOMEPAGE_ACCESS',
            payload: result.data });
          this.loadAdmins()
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
  loadAdmins(){
    this.setState({ loading_admins: true })
    let token = this.props.cookies.get('token');
    authorizeUser(token, '/users/find_all_admins', null, 'get')
      .then(result => {
        console.log("result all admins:",result)
        if (result){
          this.setState({
            admins: result.data,
            loading_admins: false
          })
        }
        else {
          console.log('Error: no result on mount.')
          //this.props.dispatch({ type: 'LOGOUT' });
        }
      })
      .catch(error => {
        console.log(error)
        //this.props.dispatch({ type: 'LOGOUT' });
      })
  }

  render() {
    console.log('STATE',this.state)
    if (this.props.loading){
      return (<Loading component="Console"/>);
    }
    else if (!this.props.logged_in || this.state.redirect_to_root){
      return (<Redirect to="/" />);
    }
    else if (this.state.loading_admins){
      return (<Loading component={'Admin Users'}/>);
    }
    else if(!this.props.user_info.is_super_admin){
      return (<Redirect to="/" />);
    }
    else {
      console.log('info',this.props.user_info)
      return (
      <div style={{padding:'2em'}}>
      <Jumbotron style={{minHeight:'27em', paddingTop:'0', 
        textAlign:'center'}}>
        <div style={{paddingBottom:'1em'}}>
          <h4>Super Administrator Console {' '}</h4>
        </div>
        <AdminsListGroup
          admins={this.state.admins}
          show_admins={this.state.show_admins}
          token={this.props.cookies.get('token')}
          dispatch={this.props.dispatch}
        />
      </Jumbotron>
      </div>
      );
    }
  }
}

const mapStateToProps = (state, ownProps) => ({
  logged_in: state.logged_in,
  user_info: state.user_info,
  loading: state.loading
});
export default withRouter(connect(mapStateToProps)(SuperAdminConsole));