import React, { Component } from 'react';
import authorizeUser from './Auth'
import { Redirect } from 'react-router';
import { connect } from 'react-redux'
import Loading from './components/Loading'
import GroupSearch from './components/GroupSearch'
import UserHomeOptions from './components/UserHomeOptions'
import { Jumbotron, Button, Col } from 'reactstrap';
import Collapse from 'reactstrap/lib/Collapse';
import { GoSearch } from 'react-icons/go';

class Home extends Component {
  constructor(props){
    super(props);
    this.state = {
      searching: false,
      lock: false
    }
  }
  async componentDidMount() {
    console.log('home mounted')
    this.props.dispatch({ type: 'LOADING' });
    const { cookies } = this.props;
    let token = cookies.get('token');
    
    await authorizeUser(token, '/authorize')
      .then(result => {
        console.log("result home:",result)
        if (result){

          this.props.dispatch({ 
            type: 'HOMEPAGE_ACCESS',
            payload: result.data });
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
    const { cookies } = this.props;
    console.log("home cookies:", cookies.get('token'),
    this.props.logged_in);

    if (this.props.loading){
      return (<Loading component="Groups"/>);
    }
    else if (!this.props.logged_in){
      return (<Redirect to="/" />);
    }
    else if (Object.keys(this.props.user_info).length === 0){
      return (<Loading component="Groups"/>);
    }
    else {

      return (
      <div style={{padding:'2em'}}>
      <Jumbotron style={{minHeight:'27em', paddingTop:'0', 
        textAlign:'center'}}>
        <Button color="primary" onClick={()=>{
          this.setState({searching: !this.state.searching})
        }}>{this.state.searching ? ' Your Groups':
          <div>{' Search Groups '} <GoSearch/></div> }</Button>
        
        <Collapse isOpen={!this.state.searching}>
        <div style={{paddingTop:'1em'}}>
        <h6>Username: {this.props.user_info.username}, 
        Email: {this.props.user_info.email},
        {this.props.user_info.is_supervisor ? 
          ' Supervisor' : ' Regular User' }</h6>
        
        <h4>{'group_ids' || 
          'managed_group_ids' in this.props.user_info ? 
          <UserHomeOptions cookies={this.props.cookies} 
            info={this.props.user_info}/> : null}</h4>

        </div>
        </Collapse>
        <Collapse isOpen={this.state.searching} style={{padding:'0'}}>
        <Col>
          {this.props.user_info.is_supervisor ?
          <div style={{display:'flex', justifyContent:'center', 
            paddingTop:'0.5em'}}>
            <p style={{fontSize:'12px', margin: '0', color:'#474747'}}>
            Admin accounts are for creating and managing groups. 
            You can only join other groups with a regular user account.</p>
          </div> : null }
          <div style={{display:'flex', justifyContent:'center'}}>
            <GroupSearch 
              is_supervisor={this.props.user_info.is_supervisor}
              token={this.props.cookies.get('token')}
              group_ids={this.props.user_info.group_ids.concat(
                this.props.user_info.managed_groups_ids)}
              requested_to_join_groups_ids=
                {this.props.user_info.requested_to_join_groups_ids}
              invited_groups_ids=
                {this.props.user_info.invited_groups_ids}
              cookies={this.props.cookies}
              dispatch={this.props.dispatch}/> 
          </div>
        </Col>
        </Collapse>
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
export default connect(mapStateToProps)(Home);