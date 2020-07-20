import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, Media,Row,
  Navbar, Container, ButtonDropdown, ButtonGroup,
  DropdownItem, DropdownToggle, DropdownMenu } from 'reactstrap';
import { connect } from 'react-redux'
import { withCookies } from 'react-cookie';
import { Link } from 'react-router-dom'
import Register from '../Register'
import Notification from './Notification';
import Login from '../Login'
import LogoImg from '../img/NavbarLogo2.png';
import LogoHoverImg from '../img/NavbarLogoHover.png';
import { IoMdNotifications } from 'react-icons/io';

const AppNavbar = (props) => {

  const [modal, setModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [dropdownOpen, setDropdown] = useState(false);
  const [notificationsOpen, setNotifications] = useState(false);
  const [keepNotifsOpen, setKeepNotifsOpen] = useState(false);
  const [type, setType] = useState(false);
  const [typeText, setTypeText] = useState(false);
  const [logoHover, setLogoHover] = useState(false);

  const toggle = () => setModal(!modal);
  const toggleDropdown = () => setDropdown(!dropdownOpen);
  const toggleNotifications = () => setNotifications(!notificationsOpen);
  const toggleLogoutModal = () => {
    setLogoutModal(!logoutModal)
  }
  const toggleLogin = () => {
    setType('login');
    setTypeText('Login');
    setModal(!modal);
  }
  const toggleRegAdmin = () => {
    setType('admin');
    setTypeText('Register as Administrator');
    setModal(!modal);
  }
  const toggleRegRegular = () => {
    setType('regular');
    setTypeText('Register as Regular User');
    setModal(!modal);
  }
  function NavButtonsLoggedIn(props) {
    return (
        <ButtonGroup onMouseLeave={()=>{setKeepNotifsOpen(false)}}> 
          {props.notifications ? 
          <ButtonDropdown isOpen={notificationsOpen || keepNotifsOpen} 
            toggle={toggleNotifications} >
            <DropdownToggle color="primary">
              <IoMdNotifications style={{marginBottom:'0.2em'}}/>
              <a style={{fontSize:'14px'}}>
                {props.unread_notifications_count > 0 ?
                  props.unread_notifications_count : null}
              </a>
            </DropdownToggle>
            <DropdownMenu size="sm" style={{backgroundColor:'lightgray',
              paddingTop:'0', paddingBottom:'0'}}
              onMouseEnter={()=>{setKeepNotifsOpen(true)}}>
              {Object.keys(props.notifications).reverse().map(function(key) {
                return(
                  (props.notifications.length > 5 && 
                  key >= props.notifications.length - 5)
                  || props.notifications.length <= 5 ? 
                  <DropdownItem toggle={false}
                    key={key} style={{fontSize:'12px', paddingLeft:'0',
                      backgroundColor: props.notifications[key].read ? 
                      'lightgray':'white', paddingBottom:'0'}}>
                    <Notification token={props.token}
                      dispatch={props.dispatch} index={key} 
                      read={props.notifications[key].read}
                      content={props.notifications[key].content}/>
                    <hr className="my-6" 
                      style={{marginTop:'0.3em', marginBottom:'0'}}/>
                  </DropdownItem> : null
                )
              })}
              <DropdownItem style={{fontSize:'12px'}}>
                <Row>
                  <p style={{maxWidth: '23em', margin: '0', 
                    paddingLeft: '0.5em'}}>
                    <Link to="/notifications">
                      See all Notifications</Link></p>
                </Row>
              </DropdownItem>
            </DropdownMenu>
          </ButtonDropdown> : null }
          {props.notifications && (notificationsOpen || keepNotifsOpen) ? 
          <ButtonDropdown isOpen={false}>
            <DropdownToggle color="primary">
              <Link to="/notifications" style={{color:'white'}}>
                Notifications
              </Link>
            </DropdownToggle>
          </ButtonDropdown>
          :null}
          
          <Button color="primary">
            <Link to="/groups" style={{color:'white'}}>
              Groups
            </Link>
          </Button> 
          <ButtonDropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
          <DropdownToggle color="primary" caret>
            Settings
          </DropdownToggle>
          <DropdownMenu right>
            <DropdownItem>Profile</DropdownItem>
            <DropdownItem onClick={toggleLogoutModal}>Logout</DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
        </ButtonGroup>)
  }
  function NavButtonsLoggedOut() {
    return (
      <ButtonGroup>
        <ButtonDropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
          <Button color="primary" onClick={toggleLogin}>Login</Button>
          <DropdownToggle color="primary" caret>
            Register
          </DropdownToggle>
          <DropdownMenu right>
            <DropdownItem onClick={toggleRegAdmin}>Register as Admin User</DropdownItem>
            <DropdownItem onClick={toggleRegRegular}>Register as Regular User</DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
      </ButtonGroup>)
  }
  return (
    <div id="AppNavbar" style={{height: '54px',minHeight: '100%'}}> 
      <Navbar color="#2D70CE" dark expand="lg" className="mb-5" 
        style={{width:'100%',float: 'left'}}>
          <Container>
          <Link to={"/"} >
          <Media
          onMouseLeave={()=>{setLogoHover(false)}} 
          onMouseEnter={()=>{setLogoHover(true)}}
          style={{width:'5em'}} 
          object src={logoHover ? LogoHoverImg: LogoImg} 
          alt="Civitas Logo"/>
          </Link>
          <div style={{marginLeft:'40em'}}>
          {props.logged_in ? 
          <NavButtonsLoggedIn
            token={props.cookies.get('token')}
            dispatch={props.dispatch}
            unread_notifications_count={props.user_info.unread_notifications_count}
            notifications={props.user_info.notifications}/> 
          : <NavButtonsLoggedOut /> }
          </div>
          </Container> 


        <Modal isOpen={modal && !props.logged_in} toggle={toggle} style={{opacity:"0.9"}}>
          <ModalHeader toggle={toggle}>{typeText}</ModalHeader>
          <ModalBody>
            {type==='login' ? <Login cookies={props.cookies} toggleModal={toggle}/> : 
            <Register usertype={type} cookies={props.cookies} toggleModal={toggle}/>}
          </ModalBody>
        </Modal>
        <Modal isOpen={logoutModal && props.logged_in} toggle={toggleLogoutModal} style={{opacity:"0.9"}}>
          <ModalHeader toggle={toggleLogoutModal}>Confirm Logout</ModalHeader>
          <ModalBody>
            <h5 style={{textAlign: "center"}}>Are you sure you want to logout?</h5>
            <div style={{textAlign: "center"}}>
              <Button onClick={() => {
                toggleLogoutModal();
                props.cookies.remove('token', { path: '/' });
                console.log('Removed Cookie!', props.cookies.get('token'))
                props.dispatch({ type: 'LOGOUT' });
              }} style={{marginRight: "10%"}} color="primary"> Yes, log me out. </Button>
              <Button onClick={toggleLogoutModal}>Cancel</Button>
            </div>
          </ModalBody>
        </Modal>
      </Navbar>

    </div>
  );
}


const mapStateToProps = (state) => ({
  logged_in: state.logged_in,
  user_info: state.user_info,
  loading: state.loading
});

//export default connect(mapStateToProps)(App);
export default withCookies(connect(mapStateToProps)(AppNavbar));

//export default AppNavbar;