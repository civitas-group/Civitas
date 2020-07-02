import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody,
  Navbar, Container, ButtonDropdown, ButtonGroup,
  DropdownItem, DropdownToggle, DropdownMenu } from 'reactstrap';
import { connect } from 'react-redux'
import { withCookies } from 'react-cookie';
import { Link } from 'react-router-dom'
import Register from '../Register'
import Login from '../Login'


const AppNavbar = (props) => {

  const [modal, setModal] = useState(false);
  const [dropdownOpen, setDropdown] = useState(false);
  const [type, setType] = useState(false);
  const [typeText, setTypeText] = useState(false);

  const toggle = () => setModal(!modal);
  const toggleDropdown = () => setDropdown(!dropdownOpen);
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
  function NavButtonsLoggedIn() {
    return (
        <ButtonGroup>
          <Link to="/groups">
            <Button color="primary">Groups</Button>
          </Link>
          <ButtonDropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
          <DropdownToggle color="primary" caret>
            Settings
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem>Profile</DropdownItem>
            <DropdownItem 
            onClick={() => {
              props.cookies.remove('token', { path: '/' });
              console.log('Removed Cookie!', props.cookies.get('token'))
              props.dispatch({ type: 'LOGOUT' });
            }}>Logout</DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
        </ButtonGroup>)
  }
  function NavButtonsLoggedOut() {
    return (
      <ButtonGroup>
        <ButtonDropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
          <DropdownToggle color="primary" caret>
            Register
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem onClick={toggleRegAdmin}>Register as Admin User</DropdownItem>
            <DropdownItem onClick={toggleRegRegular}>Register as Regular User</DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
        <Button color="primary" onClick={toggleLogin}>Login</Button>
      </ButtonGroup>)
  }

  return (
    <div id="AppNavbar" style={{height: '54px',minHeight: '100%'}}> 
      <Navbar color="#2D70CE" dark expand="lg" className="mb-5" 
        style={{width:'100%',float: 'left'}}>
          <Container>
              <Link to={"/"}>
              <Button color="primary">Civitas</Button>
              </Link>
              {props.logged_in ? <NavButtonsLoggedIn/> : <NavButtonsLoggedOut /> }
          </Container> 


        <Modal isOpen={modal && !props.logged_in} toggle={toggle} style={{opacity:"0.9"}}>
          <ModalHeader toggle={toggle}>{typeText}</ModalHeader>
          <ModalBody>
            {type==='login' ? <Login cookies={props.cookies} toggleModal={toggle}/> : 
            <Register usertype={type} cookies={props.cookies} toggleModal={toggle}/>}
          </ModalBody>
        </Modal>
      </Navbar>

    </div>
  );
}


const mapStateToProps = (state) => ({
  logged_in: state.logged_in
});

//export default connect(mapStateToProps)(App);
export default withCookies(connect(mapStateToProps)(AppNavbar));

//export default AppNavbar;