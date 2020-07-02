import React, { Component } from 'react';
import authorizeUser from './Auth'
import { Redirect } from 'react-router';
import { connect } from 'react-redux'
import Loading from './components/Loading'
import { Button, Jumbotron, Media, Badge } from 'reactstrap';
import Login from './img/Login.png';
import LoginHover from './img/LoginHover.png';
import Register from './img/Register.png';
import RegisterHover from './img/RegisterHover.png';
import Logo from './img/Logo.png';
import Houses from './img/HousesMedium.png';
import { AiTwotoneHome } from 'react-icons/ai';

class PublicHome extends Component {
  constructor(props){
    super(props);
    this.state = {
      login_hover: false,
      regiser_hover: false,
      show_info: false,
      show_resident_info: false
    }
  }
  componentDidMount() {
    document.body.style.overflow = 'hidden';
  }
  componentWillUnmount() {
    document.body.style.overflow = 'unset';
  }
  render() {
    const { cookies } = this.props;
    console.log("public home cookies:", cookies.get('token'),
    this.props.logged_in);


    if (this.props.loading){
      return (<Loading />);
    }
    else {
      return (
        
      <Jumbotron style={{paddingBottom:'0'}}>
        <Media>

          { this.state.show_info ? 
          <Jumbotron style={{paddingLeft:'5em',paddingTop:'2em',
            width:'35em'}}>
            <h5 style={{display:'flex', 
              justifyContent:'center'}}>Are you an apartment &nbsp;<b>
              {this.state.show_resident_info ? 'resident' : 'manager'}</b>?&nbsp;
              <Button color="link" style={{padding:'0'}}
                onClick={()=>{
                  this.setState({show_resident_info: 
                  !this.state.show_resident_info})}}>
              <Badge color="secondary" size="sm">{'other'}</Badge>
              </Button>
            </h5>
          </Jumbotron> 
          :
          <Media left top >
            <Media 
              style={{paddingLeft:'5em',paddingTop:'2em',maxWidth:'35em'}} 
              object src={Logo} alt="Generic placeholder image"/>
          </Media>}

          <Jumbotron style={{paddingLeft:'5em',backgroundColor:'#FFFFF'}}>
            <Button outline color="primary" 
              onMouseLeave={()=>{this.setState({login_hover: false})}} 
              onMouseEnter={()=>{this.setState({login_hover: true})}}>
              <Media right top>
                <Media onMouseLeave={()=>{this.setState({login_width: '10em'})}} 
                  onMouseEnter={()=>{this.setState({login_width: '10em'})}}
                  style={{maxWidth:'10em'}} 
                  object src={this.state.login_hover ? 
                    LoginHover : Login} alt="Login" />
              </Media>
            </Button>
            <Media className="mt-1">

            <Button outline color="primary" 
              onMouseLeave={()=>{this.setState({regiser_hover: false})}} 
              onMouseEnter={()=>{this.setState({regiser_hover: true})}}>
              <Media middle>
                <Media 
                  style={{maxWidth:'10em'}} 
                  object src={this.state.regiser_hover ? 
                  RegisterHover : Register} alt="Register" />
              </Media>
            </Button>

            </Media>
          </Jumbotron>

        </Media>
        <Media style={{paddingLeft:'15em'}} >
          <Button onClick={() => {
            this.setState({show_info: !this.state.show_info})}} 
            color="link">Guide 
            <AiTwotoneHome style={{paddingBottom:'0.2em'}}/>
          </Button>
        </Media>

        <Media
          className="mt-1" 
          style={{display:'flex', justifyContent:'center'}}>
          <Media left bottom>
            <Media object style={{maxWidth:'80em'}} 
            src={Houses} alt="Generic placeholder image" />
          </Media>
        </Media>

      </Jumbotron>
      );
    }
  }
}

const mapStateToProps = (state, ownProps) => ({
  logged_in: state.logged_in,
  user_info: state.user_info,
  loading: state.loading
});
export default connect(mapStateToProps)(PublicHome);