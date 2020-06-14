import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Redirect, withRouter } from 'react-router';
import Loading from './components/Loading'
import authorizeUser from './Auth'
import { Jumbotron } from 'reactstrap';

class Group extends Component {
  constructor(props){
    super(props);
  }
  state = {
    posts: [],
    redirect_to_root: false
  };
  componentDidMount() {
    this.props.dispatch({ type: 'LOADING' });
    const { cookies } = this.props;
    let token = cookies.get('token');
    let endpoint = '/dev/group/' + this.props.match.params.group_id;
    console.log('group check endpoint:', endpoint)
    authorizeUser(token, endpoint)
      .then(result => {
        console.log("result:",result)
        if (result){
          if (!result.data.group_ids.includes(this.props.match.params.group_id)){
            this.setState({redirect_to_root:true})
          }
          this.setState({posts: result.data.posts})
          delete result.data.posts;
          this.props.dispatch({ 
            type: 'GROUP_ACCESS',
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
    console.log(this.props.loading, this.props.logged_in)
    console.log("token group",
    this.props.cookies.get('token'), this.props.logged_in)

    if (this.props.loading){
      return (<Loading />);
    }
    else if (!this.props.logged_in || this.state.redirect_to_root){
      return (<Redirect to="/" />);
    }
    else {

      return (
        <div>
          <Jumbotron>
            <h1 className="display-5">Group</h1>
              {this.props.children && React.cloneElement(this.props.children, {
                posts: this.state.posts
              })}
          </Jumbotron>
        </div>
      );
    }
  }
}

const mapStateToProps = (state) => ({
    logged_in: state.logged_in,
    user_info: state.user_info,
    loading: state.loading
});
  
export default withRouter(connect(mapStateToProps)(Group));
