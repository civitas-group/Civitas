import React, { Component, useState } from 'react';
import authorizeUser from './Auth'
import { Redirect, withRouter} from 'react-router';
import { connect } from 'react-redux'
import Loading from './components/Loading'
import ConsoleUsersListGroup from './components/ConsoleUsersListGroup'
import ConsoleReviewsListGroup from './components/ConsoleReviewsListGroup'
import { Jumbotron, Button, Badge, ButtonGroup, Collapse } from 'reactstrap';

class AdminConsole extends Component {
  constructor(props){
    super(props);
    this.state = {
      group_name: "",
      address: "",
      supervisor_id: "",
      loading_users: true,
      loading_invited_users: true,
      loading_requested_to_join_users: true,
      loading_reviews: true,
      cosupervisor_ids: [],
      user_ids: [],
      users: [],
      invited_user_ids: [],
      invited_users: [],
      requested_to_join_user_ids: [],
      requested_to_join_users: [],
      pending_reviews: [],
      completed_reviews: [],
      ratings: [],
      show_users: false,
      show_requested_to_join_users: false,
      show_invited_users: false,
      show_reviews: false,
    }
    this.toggleRequested = this.toggleRequested.bind(this);
    this.toggleInvited = this.toggleInvited.bind(this);
    this.toggleRegular = this.toggleRegular.bind(this);
    this.toggleReviews = this.toggleReviews.bind(this);
  }
  componentDidMount() {
    console.log('Console mount')
    this.props.dispatch({ type: 'LOADING' });
    const { cookies } = this.props;
    let token = cookies.get('token');
    let endpoint = '/group/' + this.props.match.params.group_id;
    console.log('console check endpoint:', endpoint)
    authorizeUser(token, endpoint)
      .then(result => {
        console.log("result console:",result)
        if (result){
          if (!result.data.group_ids.includes(this.props.match.params.group_id)
            && !result.data.managed_groups_ids.includes(this.props.match.params.group_id)){
            this.setState({redirect_to_root:true})
            return;
          }          

          delete result.data.posts;
          if (result.data.hasOwnProperty('announcements')) {
            delete result.data.announcements;
          }
          this.props.dispatch({
            type: 'GROUP_ACCESS',
            payload: Object.assign(result.data, {
              group_id: this.props.match.params.group_id
            })});
          this.toggleRequested()
        }
        else {
          console.log('Error: no result on mount.')
          this.props.dispatch({ type: 'LOGOUT' });
        }
      })
      .catch(error => {
        console.log(error)
        try{
          if (error.response.data.error === "Invalid group"){
            this.setState({redirect_to_root:true})
          }
        }
        catch {
          this.props.dispatch({ type: 'LOGOUT' });
        }
        
      })
  }
  loadUsers(type, user_ids){
    console.log('load users:',type, user_ids)
    this.setState({ ['loading_' + type]: true })
    let token = this.props.cookies.get('token');
    authorizeUser(token, '/users/findmultiple', {'user_ids': user_ids})
      .then(result => {
        console.log("result group:",result)
        if (result){
          this.setState({
            [type]: result.data.users,
            ['loading_' + type]: false
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
  loadReviews(pending_reviews, completed_reviews){
    console.log('load reviews:', pending_reviews, completed_reviews)
    this.setState({ loading_reviews: true })
    let token = this.props.cookies.get('token');
    let req_body = {
      'pending_reviews': pending_reviews,
      'completed_reviews': completed_reviews
    }
    authorizeUser(token, '/review/findmultiple', req_body)
      .then(result => {
        console.log("result reviews:",result)
        if (result){
          this.setState({
            pending_reviews: result.data.pending_reviews,
            completed_reviews: result.data.completed_reviews,
            ratings: result.data.ratings,
            loading_reviews: false,
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
  toggleRequested(){
    if(this.props.user_info.requested_to_join_user_ids.length !==
      this.state.requested_to_join_users.length){
      this.loadUsers('requested_to_join_users', 
        this.props.user_info.requested_to_join_user_ids);
    }
    
    this.setState({
      show_requested_to_join_users: !this.state.show_requested_to_join_users,
      show_invited_users: false,
      show_reviews: false,
      show_users: false
    })
  }
  toggleInvited(){
    if(this.props.user_info.invited_user_ids.length !==
      this.state.invited_users.length){
      this.loadUsers('invited_users', 
        this.props.user_info.invited_user_ids);
    }
    this.setState({
      show_requested_to_join_users: false,
      show_invited_users: !this.state.show_invited_users,
      show_reviews: false,
      show_users: false
    })
  }
  toggleRegular(){
    if(this.props.user_info.user_ids.length !==
      this.state.users.length){
      this.loadUsers('users', this.props.user_info.user_ids);
    }
    this.setState({
      show_requested_to_join_users: false,
      show_invited_users: false,
      show_reviews: false,
      show_users: !this.state.show_users
    })
  }
  toggleReviews(){
    if(this.props.user_info.pending_reviews.length !==
      this.state.pending_reviews.length ||
      this.props.user_info.completed_reviews.length !==
      this.state.completed_reviews.length){
      this.loadReviews(this.props.user_info.pending_reviews, 
        this.props.user_info.completed_reviews);
    }
    
    this.setState({
      show_requested_to_join_users: false,
      show_invited_users: false,
      show_users: false,
      show_reviews: !this.state.show_reviews
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
    else if (!this.props.user_info.hasOwnProperty('requested_to_join_user_ids')
      || !this.props.user_info.hasOwnProperty('invited_user_ids')
      || !this.props.user_info.hasOwnProperty('user_ids')){
      return (<Loading component={'Users'}/>);
    }
    else if(!this.props.user_info.is_supervisor || 
      this.props.user_info.managed_groups_ids.indexOf(
        this.props.match.params.group_id) === -1){
      return (<Redirect to="/" />);
    }
    else {
      console.log('info',this.props.user_info)
      return (
      <div style={{padding:'2em'}}>
      <Jumbotron style={{minHeight:'27em', paddingTop:'0', 
        textAlign:'center'}}>
        <div style={{paddingBottom:'1em'}}>
          <h4>Administrator Console {' '}</h4>
          <h5><Badge pill color="primary">
            {this.props.user_info.group_name}</Badge></h5>
        </div>

        <ButtonGroup>
          <Button color="primary" onClick={this.toggleRequested}
            active={this.state.show_requested_to_join_users}>
            Requested Users {' '}
            {this.props.user_info.requested_to_join_user_ids.length > 0 ?
              <Badge color="primary" pill>
                {this.props.user_info.requested_to_join_user_ids.length}
              </Badge>      
            : null }
          </Button>
          <Button color="primary" onClick={this.toggleInvited}
            active={this.state.show_invited_users}>
            Invited Users</Button>
          <Button color="primary" onClick={this.toggleRegular}
            active={this.state.show_users}>
            Joined Users</Button>
          <Button color="light" onClick={this.toggleReviews}
            active={this.state.show_reviews}>
            Approve Reviews {' '}
            {this.props.user_info.pending_reviews.length > 0 ?
              <Badge color="primary" pill>
                {this.props.user_info.pending_reviews.length}
              </Badge> 
            : null}
          </Button>
        </ButtonGroup>

        <ConsoleUsersListGroup
          user_ids={this.props.user_info.user_ids}
          users={this.state.users}
          invited_user_ids={this.props.user_info.invited_user_ids}
          invited_users={this.state.invited_users}
          requested_to_join_user_ids={this.props.user_info.requested_to_join_user_ids}
          requested_to_join_users={this.state.requested_to_join_users}
          show_users={this.state.show_users}
          show_invited_users={this.state.show_invited_users}
          show_requested_to_join_users={this.state.show_requested_to_join_users}
          group_id={this.props.match.params.group_id}
          token={this.props.cookies.get('token')}
          dispatch={this.props.dispatch}
        />
        <ConsoleReviewsListGroup
          show_reviews={this.state.show_reviews}
          pending_reviews_ids={this.props.user_info.pending_reviews}
          completed_reviews_ids={this.props.user_info.completed_reviews}
          pending_reviews={this.state.pending_reviews}
          completed_reviews={this.state.completed_reviews}
          ratings={this.state.ratings}
          group_id={this.props.match.params.group_id}
          token={this.props.cookies.get('token')}
          dispatch={this.props.dispatch}
        />
        {/*<Collapse isOpen={this.state.show_reviews}>
          {Object.keys(this.state.pending_reviews).map(function(key) {
            return (
              <div key={key}>
                <span>{this.state.pending_reviews[key].requester}</span>
              </div>
            )

          }.bind(this))}
        </Collapse>*/}
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
export default withRouter(connect(mapStateToProps)(AdminConsole));