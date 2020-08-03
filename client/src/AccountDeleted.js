import React from 'react';
import { Button, Jumbotron } from 'reactstrap';
import Lottie from 'react-lottie'
import LogoAnim from './img/LogoAnim.json'

const AccountDeleted = () => {
  return (
    <div style={{'background': 'white', 'textAlign': 'center'}}>
      <Jumbotron style={{minHeight:'27em', paddingTop:'0', 
        textAlign:'center'}}>
        <h3>Account successfully deleted!</h3>
        <div style={{padding:'1em'}}>
          <Button color="primary" href="/">Return Home</Button>
        </div>
        <Lottie options={{
          loop: true,
          autoplay: true,
          animationData: LogoAnim,
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }}}
        width={500}/>

      </Jumbotron>
    </div>
  );
}

export default AccountDeleted;