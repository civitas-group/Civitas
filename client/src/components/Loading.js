import React, { Component } from 'react';
import { Spinner } from 'reactstrap';

class Loading extends Component {
  constructor(props){
    super(props);
    this.state = {
      absolute_style: {
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)'
      }
    }
  }
  render() {
    return (
      <div style={this.props.relative ? null : this.state.absolute_style}> 
        <div style={{display:'flex', justifyContent:'center'}}>
          <Spinner color={this.props.primary ? "primary" : "light"} 
            style={{ width: '2rem', height: '2rem' }} />
        </div>
        <div style={{display:'flex', justifyContent:'center', 
          color: this.props.primary ? "#007BFF" : "white"}}>
          {this.props.component ? 
          'Loading ' + this.props.component + '...' : 'Loading...'}
        </div>
      </div>
    );
  }
}
  
export default Loading;
