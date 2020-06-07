import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';

import {
    Collapse,
    Navbar,
    NavbarToggler, 
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
    Container
} from 'reactstrap';

class AppNavbar extends Component {
    constructor(props){
        super(props);
        this.state = {
            isOpen: false
        }
    }

    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        })
    }

    render() {
        return (

            <div>
                <Navbar color="dark" dark expand="lg" className="mb-5">
                    <Container>
                        <NavbarBrand href="/">Civitas</NavbarBrand>
                        <NavbarToggler onClick={this.toggle} />
                        <Collapse isOpen={this.state.isOpen} navbar/>
                            <Nav className="ml-auto" navbar>
                                <NavItem>
                                    <NavLink href="/login">Login</NavLink>
                                </NavItem>
                            </Nav>
                            <Nav className="ml-auto" navbar>
                                <NavItem>
                                    <NavLink href="/register">Register</NavLink>
                                </NavItem>
                            </Nav>
                    </Container> 

                </Navbar>
            </div>

        )

    }
}

export default AppNavbar;