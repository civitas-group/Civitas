import React, { Component } from 'react';
import { Spinner } from 'reactstrap';

class Loading extends Component {
  render() {
    return (
      <div > 
        <div style={{display:'flex', justifyContent:'center'}}>
          <Spinner style={{ width: '2rem', height: '2rem' }} />
        </div>
        <div style={{display:'flex', justifyContent:'center'}}>
          Loading...
        </div>
      </div>
    );
  }
}
  
export default Loading;
