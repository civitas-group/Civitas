import React, { useState, Component } from 'react';
import authorizeUser from './Auth';
import { Button , Modal, ModalHeader, ModalBody,} from 'reactstrap';
import { Redirect, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

class UserProfile extends Component {
    state = {
        isEditingProfile: false,
        modalOpen: false,
        redirect: false
    };

    toggleModal = () => {
        this.setState({modalOpen: !this.state.modalOpen})
    }

    setRedirect = () => {
        this.setState({redirect: true});
    }

    renderRedirect = () => {
        if (this.state.redirect) {
            return (<Redirect to="/account-deleted" />);
        }
    }

    deleteAccount = () => {
        const { cookies } = this.props;
        let token = cookies.get('token');
        let endpoint = '/account/delete';
        authorizeUser(token, endpoint, this.props.user_info, 'delete')
        .then(result => {
            if (result && result.data.success) {
                console.log("Successfully deleted account.");
            } else {
                console.log("Error deleting the account.");
            }
        })
        .catch(error => {
            console.log(error);
        })
    }
    
    render() {
        console.log("User info: ", this.props.user_info);
        if (!this.props.logged_in) {
            return (<Redirect to="/" />);
        }
        return (
        <div style={{textAlign: "center"}}>
            {this.renderRedirect()};
            <h3>User Profile</h3>
            <hr/>
            <Button color="danger" onClick={this.toggleModal} >Delete Account</Button>
            <div style={{margin: "2%"}}>
                <h5>Username: {this.props.user_info.username}</h5>
                <h5>Email: {this.props.user_info.email}</h5>
            </div>

            <Modal isOpen={this.state.modalOpen} toggle={this.toggleModal} style={{opacity:"0.9"}}>
                <ModalHeader toggle={this.toggleModal}>Confirm Account Deletion</ModalHeader>
                    <ModalBody>
                        <h5 style={{textAlign: "center"}}>Are you sure you want to delete your account?</h5>
                        <div style={{textAlign: "center"}}>
                        <Button onClick={() => {
                            this.deleteAccount();
                            this.setRedirect();
                            this.props.cookies.remove('token', { path: '/' });
                            console.log('Removed Cookie!', this.props.cookies.get('token'))
                            }} style={{marginRight: "10%"}} color="danger"> Yes, delete my account. </Button>
                        <Button onClick={this.toggleModal}>Cancel</Button>
                        </div>
                    </ModalBody>
            </Modal>
        </div>
        );
    }
}

const mapStateToProps = (state) => ({
    logged_in: state.logged_in,
    user_info: state.user_info,
    loading: state.loading,
});

export default withRouter(connect(mapStateToProps)(UserProfile));
