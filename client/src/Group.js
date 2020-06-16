import React, { Component, useState} from 'react';
import { connect } from 'react-redux'
import { Redirect, withRouter } from 'react-router';
import Loading from './components/Loading'
import authorizeUser from './Auth'
import { Jumbotron, Badge } from 'reactstrap';
import { CreatePost } from './Posts'


class Group extends Component {
  constructor(props){
    super(props);
  }
  state = {
    posts: [],
    redirect_to_root: false,
    group_name: "",
    group_id: "",
    post_body_error: false,
    post_title_error: false
  };
  componentDidMount() {
    console.log('Group mount')
    this.props.dispatch({ type: 'LOADING' });
    const { cookies } = this.props;
    let token = cookies.get('token');
    let endpoint = '/group/' + this.props.match.params.group_id;
    console.log('group check endpoint:', endpoint)
    authorizeUser(token, endpoint)
      .then(result => {
        console.log("result group:",result)
        if (result){
          
          if (!result.data.group_ids.includes(this.props.match.params.group_id)
            && !result.data.managed_groups_ids.includes(this.props.match.params.group_id)){
            this.setState({redirect_to_root:true})
          }
          this.setState({posts: result.data.posts,
                        group_name: result.data.group_name,
                        group_id: this.props.match.params.group_id})
          delete result.data.posts;
          this.props.dispatch({ 
            type: 'GROUP_ACCESS',
            payload: Object.assign(result.data, {
              group_id: this.props.match.params.group_id
            })});
          
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
      return (<Loading/>);
    }
    else if (!this.props.logged_in || this.state.redirect_to_root){
      return (<Redirect to="/" />);
    }
    else {

      return (
        <div>
          <Jumbotron>
          
            <h1 className="display-5">{this.state.group_name}</h1>
            <p><Badge color="danger" pill>Private</Badge></p>
            <h4>Posts</h4>
            <CreatePost group_id={this.state.group_id}
              username={this.props.user_info.username}
              cookies={this.props.cookies}/>
              {this.props.children && React.cloneElement(this.props.children, {
                posts: this.state.posts,
                group_id: this.props.match.params.group_id
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
