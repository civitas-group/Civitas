import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, Form,
  Navbar, Container, ButtonDropdown, ButtonGroup,
  DropdownItem, DropdownToggle, DropdownMenu } from 'reactstrap';
import { connect } from 'react-redux'
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
          <Button>Groups</Button>
          <ButtonDropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
          <DropdownToggle caret>
            Settings
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem>Profile</DropdownItem>
            <DropdownItem 
            onClick={() => {
              props.dispatch({ type: 'LOGOUT' });
              props.cookies.remove('token');
            }}>Logout</DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
        </ButtonGroup>)
  }
  function NavButtonsLoggedOut() {
    return (
      <ButtonGroup>
        <ButtonDropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
          <DropdownToggle caret>
            Register
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem onClick={toggleRegAdmin}>Register as Admin User</DropdownItem>
            <DropdownItem onClick={toggleRegRegular}>Register as Regular User</DropdownItem>
          </DropdownMenu>
        </ButtonDropdown>
        <Button onClick={toggleLogin}>Login</Button>
      </ButtonGroup>)
  }

  return (
    <div id="AppNavbar"> 
      <Navbar color="dark" dark expand="lg" className="mb-5" 
        style={{width:'100%',float: 'left'}}>
          <Container>
              <Link to="/">
              <Button>Civitas</Button>
              </Link>
              {props.logged_in ? <NavButtonsLoggedIn/> : <NavButtonsLoggedOut /> }
          </Container> 
          <Form inline onSubmit={(e) => e.preventDefault()}>

        </Form>

        <Modal isOpen={modal && !props.logged_in} toggle={toggle} style={{opacity:"0.9"}}>
          <ModalHeader toggle={toggle}>{typeText}</ModalHeader>
          <ModalBody>
            {type==='login' ? <Login cookies={props.cookies}/> : 
            <Register usertype={type} cookies={props.cookies}/>}

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
export default connect(mapStateToProps)(AppNavbar);

//export default AppNavbar;