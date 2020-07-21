import React, { Component } from 'react';
import { Jumbotron, Toast, ToastBody, Badge, 
  Button } from 'reactstrap';
import { connect } from 'react-redux';
import { Redirect } from 'react-router';
import authorizeUser from './Auth';
import Loading from './components/Loading';
import Notification from './components/Notification';

class Notifications extends Component {
  page_size = 10;
  constructor(props){
    super(props);
    this.state = {
      max_results: this.page_size
    }
  }
  
  async componentDidMount() {
    console.log('notifications mounted')
    this.props.dispatch({ type: 'LOADING' });
    const { cookies } = this.props;
    let token = cookies.get('token');
    
    await authorizeUser(token, '/authorize')
      .then(result => {
        console.log("result notifications:",result)
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
    console.log("notifications cookies:", cookies.get('token'),
    this.props.logged_in);

    if (this.props.loading){
      return (<Loading component="Notifications"/>);
    }
    else if (!this.props.logged_in){
      return (<Redirect to="/" />);
    }
    else if (Object.keys(this.props.user_info).length === 0){
      return (<Loading component="Notifications"/>);
    }
    else {
      console.log('CHECK',this.state.max_results, this.props.user_info.notifications.length)
      return (
      <div style={{padding:'2em',paddingTop:'0', 
        display:'flex', justifyContent:'center'}}>
      <Jumbotron style={{minHeight:'27em', paddingTop:'0', 
        textAlign:'center'}}>
        <div>
          <h4>Notifications {' '}
          {this.props.user_info.unread_notifications_count > 0 ? 
          <Badge color="primary">
            {this.props.user_info.unread_notifications_count}
          </Badge>
          : null}
          </h4>
        </div>
        
        {Object.keys(this.props.user_info.notifications).reverse().map(
          function(key) {
          return(
            (this.props.user_info.notifications.length > this.state.max_results && 
              key >= this.props.user_info.notifications.length - this.state.max_results)
              || this.props.user_info.notifications.length <= (this.state.max_results) ? 
            <Toast key={key} style={{width:'40em'}}>
            <ToastBody style={{fontSize:'13px', paddingLeft:'0',
                backgroundColor: this.props.user_info.notifications[key].read ? 
                'lightgray':'white', paddingBottom:'0', 
                paddingTop:'0.3em'}}>

              <Notification 
                is_main_page={true}
                token={this.props.cookies.get('token')}
                dispatch={this.props.dispatch} index={key} 
                read={this.props.user_info.notifications[key].read}
                content={this.props.user_info.notifications[key].content}/>

              <hr className="my-6" 
                style={{marginTop:'0.3em', marginBottom:'0'}}/>
            </ToastBody>
            </Toast> : null
          )
        }.bind(this))}

        {(this.state.max_results >= this.props.user_info.notifications.length) 
          ? null :
        <div style={{display:'flex', justifyContent:'center', 
          paddingTop:'0.5em', paddingBottom: '4em'}}>
          <Button color="light" size="sm"
            onMouseEnter={()=>{
              this.setState({max_results: this.state.max_results + this.page_size})
            }}
            onClick={()=>{
              this.setState({max_results: this.state.max_results + this.page_size})
            }}
            >See More...</Button>
        </div> }
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
export default connect(mapStateToProps)(Notifications);