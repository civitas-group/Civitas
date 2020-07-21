import React, { Component } from 'react';
import authorizeUser from './Auth'
import { Redirect } from 'react-router';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux'
import Loading from './components/Loading'
import { Button, Jumbotron, Media, Badge, Fade,
Modal, ModalBody, ModalHeader } from 'reactstrap';
import Register from './Register';
import Login from './Login';
import LoginImg from './img/Login.png';
import LoginHoverImg from './img/LoginHover.png';
import RegisterImg from './img/Register.png';
import RegisterHoverImg from './img/RegisterHover.png';
import RegisterAdminImg from './img/RegisterAdmin.png';
import RegisterRegularImg from './img/RegisterRegular.png';
import GroupsImg from './img/Groups.png';
import GroupsHoverImg from './img/GroupsHover.png';
import LogoImg from './img/Logo.png';
import LogoHoverImg from './img/LogoHover.png';
import HousesImg from './img/HousesMedium.png';
import HousesHoverImg from './img/HousesMediumHover.png';
import { AiTwotoneHome } from 'react-icons/ai';
import Lottie from 'react-lottie'
import LogoAnim from './img/LogoAnim.json'

class PublicHome extends Component {
  constructor(props){
    super(props);
    this.state = {
      login_hover: false,
      register_hover: false,
      houses_hover: false,
      show_info: false,
      show_resident_info: false,
      show_register_info: false,
      logo_hover: false,
      modal: false,
      type: false,
      typeText: "login",
      login_form: {},
      register_form: {}
    };
    this.toggleRegister = this.toggleRegister.bind(this);
    this.toggle = this.toggle.bind(this);
    this.toggleLogin = this.toggleLogin.bind(this);
    this.toggleRegAdmin = this.toggleRegAdmin.bind(this);
    this.toggleRegRegular = this.toggleRegRegular.bind(this);
    this.setLoginForm = this.setLoginForm.bind(this);
    this.setRegisterForm = this.setRegisterForm.bind(this);
  }

  toggle = () => this.setState({modal: !this.state.modal});
  toggleLogin = () => {
    this.setState({
      type: 'login',
      typeText: 'Login',
      modal: !this.state.modal
    })
  }
  toggleRegAdmin = () => {
    this.setState({
      type: 'admin',
      typeText: 'Register as Administrator',
      modal: !this.state.modal
    })
  }
  toggleRegRegular = () => {
    this.setState({
      type: 'regular',
      typeText: 'Register as Regular User',
      modal: !this.state.modal
    })
  }
  toggleRegister() {
    this.setState({
      show_register_info: !this.state.show_register_info
    }) 
  }
  setLoginForm = (formData) => {
    this.setState({
      login_form: formData
    });
  }
  setRegisterForm = (formData) => {
    this.setState({
      register_form: formData
    });
  }

  componentDidMount() {
    document.body.style.overflow = 'hidden';

    if (this.props.hasOwnProperty('cookies')){
      this.props.dispatch({ type: 'LOADING' });
      const { cookies } = this.props;
      let token = cookies.get('token');
      
      authorizeUser(token, '/authorize')
        .then(result => {
          console.log("result home:",result)
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
        <div >
        <Jumbotron style={{paddingBottom:'0'}}>
        <Media style={{display:'flex', justifyContent:'center'}}>

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
          <Media left top style={{paddingLeft:'3.75em'}}>
            <Lottie options={{
              loop: true,
              autoplay: true,
              animationData: LogoAnim,
              rendererSettings: {
                preserveAspectRatio: 'xMidYMid slice'
              }}}
              width={500}/>
          </Media>}
          {this.props.logged_in ? 
          <Jumbotron style={{paddingLeft:'5em',
            paddingTop:'6.13em', paddingBottom:'6.13em',backgroundColor:'#FFFFF'}}>
            <Media className="mt-1">
              <Link to="/groups">
              <Button outline color="primary" 
                onMouseLeave={()=>{this.setState({register_hover: false})}} 
                onMouseEnter={()=>{this.setState({register_hover: true})}}>
                <Media middle>
                  <Media 
                    style={{maxWidth:'10em'}} 
                    object src={this.state.register_hover ? 
                    GroupsHoverImg : GroupsImg} alt="Groups" />
                </Media>
              </Button>
              </Link>
            </Media>
          </Jumbotron>
          :
          <Jumbotron style={{paddingLeft:'5em',backgroundColor:'#FFFFF',
          paddingRight:'0'}}>
            <Button outline color="primary" onClick={this.toggleLogin}
              onMouseLeave={()=>{this.setState({login_hover: false})}} 
              onMouseEnter={()=>{this.setState({login_hover: true})}}>
              <Media right top>
                <Media
                  style={{maxWidth:'10em'}} 
                  object src={this.state.login_hover ? 
                  LoginHoverImg : LoginImg} alt="Login" />
              </Media>
            </Button>
            <Media className="mt-1">
              <Button outline color="primary" onClick={this.toggleRegister}
                onMouseLeave={()=>{this.setState({register_hover: false})}} 
                onMouseEnter={()=>{this.setState({register_hover: true})}}>
                <Media middle>
                  <Media 
                    style={{maxWidth:'10em'}} 
                    object src={this.state.show_register_info ?
                    RegisterHoverImg : (this.state.register_hover ? 
                    RegisterHoverImg : RegisterImg)} alt="Register" />
                </Media>
              </Button>
            </Media>
            </Jumbotron> }
            <Fade in={this.state.show_register_info}>
              <Jumbotron style={{padding:'0',
              paddingTop:'8.35em', paddingBottom:'3.91em',
              backgroundColor:'#FFFFF'}}>
                <Button color="primary" style={{padding:'0.15em'}}
                  onClick={this.toggleRegRegular}>
                  <Media right top>
                    <Media
                      style={{maxWidth:'10em'}} 
                      object src={RegisterRegularImg} 
                      alt="Register as a Regular User" />
                  </Media>
                </Button>
                <Media className="mt-1">
                  <Button color="primary" style={{padding:'0.15em'}}
                    onClick={this.toggleRegAdmin}>
                    <Media middle>
                      <Media 
                        style={{maxWidth:'10em'}} 
                        object src={RegisterAdminImg} 
                        alt="Register as an Administrator" />
                    </Media>
                  </Button>
                </Media>
              </Jumbotron>
            </Fade>
        </Media>
        <Media style={{display:'flex', justifyContent:'center',
            paddingRight:'23.5em'}} >
          <Button onClick={() => {
            this.setState({show_info: !this.state.show_info})}} 
            color="link">Guide 
            <AiTwotoneHome style={{paddingBottom:'0.2em'}}/>
          </Button>
        </Media>

        <Media
          className="mt-1" 
          style={{display:'flex', justifyContent:'center'}}>
          <Media left bottom               
              onMouseLeave={()=>{this.setState({houses_hover: false})}} 
              onMouseEnter={()=>{this.setState({houses_hover: true})}}>
            <Media object style={{maxWidth:'84em'}} 
            src={this.state.houses_hover ? HousesHoverImg: 
            HousesImg} alt="Civitas Houses Graphic" />
          </Media>
        </Media>

      </Jumbotron>
      <Modal isOpen={this.state.modal && !this.props.logged_in} 
        toggle={this.toggle} style={{opacity:"0.9"}}>
        <ModalHeader toggle={this.toggle}>{this.state.typeText}</ModalHeader>
        <ModalBody>
          {this.state.type==='login' ? 
          <Login formData={this.state.login_form} setFormData={this.setLoginForm} cookies={this.props.cookies} toggleModal={this.toggle} /> : 
          <Register formData={this.state.register_form} setFormData={this.setRegisterForm} usertype={this.state.type} cookies={this.props.cookies} toggleModal={this.toggle} />}
        </ModalBody>
      </Modal>
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
export default connect(mapStateToProps)(PublicHome);