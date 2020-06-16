import React, { Component } from 'react';
import authorizeUser from './Auth'
import { Redirect } from 'react-router';
import { connect } from 'react-redux'
import Loading from './components/Loading'
import UserHomeOptions from './components/UserHomeOptions'
import { Jumbotron } from 'reactstrap';

class Home extends Component {
  constructor(props) {
    super(props);
  };
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
      return (<Loading />);
    }
    else if (!this.props.logged_in){
      return (<Redirect to="/" />);
    }
    else {
      return (
        
      <div  style={{padding:'2em'}}>
      <Jumbotron>
        <h4>Username: {this.props.user_info.username}</h4>
        <h4>Email: {this.props.user_info.email}</h4>
        <h4>Is supervisor?: {this.props.user_info.is_supervisor ? 
          <p>Yes</p> : <p>No</p> }</h4>
        
        <h4>{'group_ids' || 
          'managed_group_ids' in this.props.user_info ? 
          <UserHomeOptions info={this.props.user_info}/> : null}</h4>
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