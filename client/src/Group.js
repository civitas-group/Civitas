import React, { Component } from 'react';
import { connect } from 'react-redux'

class Group extends Component {
  constructor(props){
    super(props);
  }
  render() {
    console.log("token group",
    this.props.cookies.get('token'), this.props.logged_in)
    return (

      <div> 
      GROUP
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
    logged_in: state.logged_in
});
  
export default connect(mapStateToProps)(Group);
