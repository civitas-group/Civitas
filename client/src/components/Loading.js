import React, { Component } from 'react';
import { Spinner } from 'reactstrap';

class Loading extends Component {
  render() {
    return (
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)'
        }}> 
        <div style={{display:'flex', justifyContent:'center'}}>
          <Spinner color="light" style={{ width: '2rem', height: '2rem' }} />
        </div>
        <div style={{display:'flex', justifyContent:'center', 
          color:'white'}}>
          Loading...
        </div>
      </div>
    );
  }
}
  
export default Loading;
