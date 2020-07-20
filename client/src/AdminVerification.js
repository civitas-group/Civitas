import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { connect } from 'react-redux'
import { Label, FormFeedback, FormGroup, Input, Button, Alert,
  TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import Loading from './components/Loading'
import Jumbotron from 'reactstrap/lib/Jumbotron';
import authorizeUser from './Auth';
import classnames from 'classnames';
import Drive from './img/Drive.png';
import Dropbox from './img/Dropbox.png';

class AdminVerification extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
      alert_error: "",
      result: {
        success: false,
        created_group: {}
      }, 
      localLoading: false,
      redirect_to_root: false,
      redirect_to_group: false,
      activeTab: "1",
      confirmCancel: false,
      inputting_drive: true,
      inputting_dropbox: true,
      dropbox_link: "",
      drive_link: "",
      submitted: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.submitForm = this.submitForm.bind(this);
  };


  handleChange = async (event) => {
    this.setState({ inputting_drive: true, inputting_dropbox: true })
    const { target } = event;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const { name } = target;
    await this.setState({
      [name]: value,
    });
  }

  submitForm(e, type) {
    e.preventDefault();
    this.setState({ inputting_drive: false, inputting_dropbox: false,
      submitting: true })
    console.log(type, this.state.drive_link, this.state.dropbox_link)
    if (type === 'Drive' && !this.state.drive_link) {
      this.setState({ submitting: false,
        error: "Please enter a Google Drive link."
      });
      return;
    }
    else if (type === 'Dropbox' && !this.state.dropbox_link) {
      this.setState({ submitting: false,
        error: "Please enter a Dropbox link."
      });
      return;
    }

    let token = this.props.cookies.get('token');
    let url;
    if (type === 'Dropbox') url = this.state.dropbox_link;
    else url = this.state.drive_link;
    let req_body = { 
      "group_name": this.props.group_name,
      "address": this.props.group_address,
      "file_urls": [url],
      "file_storage_type": type
    }
    authorizeUser(token, '/group/create', req_body)
      .then(result => {
        console.log("result create group request:", result)
        let data = result['data'];
        console.log(data)
        if (result.status === 200 && result.data.success === false) {
          if (result.data.msg.includes('Already supervisor')){
            this.setState({ 
              alert_error: 'You are already a supervisor for ' 
            + this.props.group_name + '!' });
          } else {
            this.setState({  
              alert_error: 'You have already submitted a request for ' 
            + this.props.group_name + '! Please send an email to '
            + 'civitasmain@gmail.com if you need your documents to be '
            + 'updated or have any other concerns.' });
          }
          return;
        } else {
          console.log("Requested group creation successfully");

          // Refresh user info in redux
          authorizeUser(token, '/authorize')
            .then(async result => {
              if (result){
                await this.props.dispatch({ 
                  type: 'INFO_RELOAD',
                  payload: result.data,
                });
                this.setState ({ submitting: false, submitted: true })
                return;
              }
              else {
                console.log('Reload notifs error')
                this.setState ({ submitting: false, submitted: true })
                return;
              }
            })
          .catch(error => {
            console.log('Reload notifs error', error)
            this.setState ({ submitting: false, submitted: true })
            return;
          })
        }
      })
      .catch(error => {
        console.log('There was an error!', error, typeof error.response.status);
        this.setState({ 
          alert_error: 'Sorry! There was an error submitting your request. '
          + 'Please send an email to civitasmain@gmail.com if you continue '
          + 'to have issues.' });
      })
  }
  toggleTab = tab => {
    if(this.state.activeTab !== tab) this.setState({ activeTab: tab });
  }
  render() {
    console.log(this.state.error, this.state.alert_error)
    if (this.props.loading){
      return (<Loading />);
    }
    else if (!this.props.logged_in || this.state.redirect_to_root){
      return (<Redirect to="/" />);
    } else if (this.state.submitted){
      return (
      <div  style={{padding:'2em'}}>
        <Jumbotron>
          <div style={{justifyContent:'center', width:"50em"}}>
            <h4>Your documents for administrator status for {' '}
              <b>{this.props.group_name}</b> {' '}
              have been submitted for review!</h4>
            <div>
            <p>
              Thank you for your initiative - you will be notified 
              when there has been a change to your document review status.  
            </p>
            </div>
            <NavLink to="/groups" style={{ padding:'0' }}>
              <Button href="/groups"color="primary">Back to Groups</Button>
            </NavLink>
          </div>
        </Jumbotron>
      </div>
      )
    }
    else {
      return (
        <div  style={{padding:'2em'}}>
        <Jumbotron>
        <div style={{justifyContent:'center', width:"50em"}}>
          <h4>Verify your Administrator Status for {' '}
            <b>{this.props.group_name}</b></h4>
          <div>
          <p>Please upload document(s) to a file sharing service of your choice
          that prove your administrative status of the residence for which you 
          are making a private group for.</p>
          </div>
          <Alert isOpen={this.state.alert_error !== ""} color="danger">
          {this.state.alert_error}
          </Alert>
        </div>
        <Nav tabs>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === '1' })}
            onClick={() => { this.toggleTab('1'); }}
          >
            <img src={Drive} alt="Drive" width="80em" />
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink
            className={classnames({ active: this.state.activeTab === '2' })}
            onClick={() => { this.toggleTab('2'); }}
          >
            <img src={Dropbox} alt="Dropbox" width="80em" />
          </NavLink>
        </NavItem>
      </Nav>
      <TabContent activeTab={this.state.activeTab}>
        <TabPane tabId="1">
          <FormGroup style={{paddingTop:'1em', maxWidth:'50em'}}>
            <Label for="DriveInstructions">Please upload a link to 
            your Google Drive Folder/File that contains your document(s) 
            and share it with {' '}
            <b>civitasmain@gmail.com</b>.</Label>
            <Input type="text" name="drive_link" 
            placeholder="Google Drive Folder/File Link"
            invalid={!this.state.drive_link && !this.state.inputting_drive}
            onChange={(e) => {this.handleChange(e)}}
            />
            <FormFeedback>Please enter a Google Drive link.</FormFeedback>
          </FormGroup>
          <Button onClick={(e)=>{this.submitForm(e, 'Drive')}}
            color="primary">Submit</Button>
        </TabPane>
        <TabPane tabId="2">
          <div>
          <FormGroup style={{paddingTop:'1em', maxWidth:'50em'}}>
            <Label for="DropboxInstructions">Please upload a link to 
            your Dropbox Folder/File that contains your document(s) 
            and share it with {' '}
            <b>civitasmain@gmail.com</b>.</Label>
            <Input type="text" name="dropbox_link" 
            placeholder="Dropbox Folder/File Link" 
            invalid={!this.state.dropbox_link && !this.state.inputting_dropbox}
            onChange={(e) => {this.handleChange(e)}}/>
            <FormFeedback>Please enter a Dropbox link.</FormFeedback>
          </FormGroup>
          </div>
          <Button disabled={this.state.submitting} 
            onClick={(e)=>{this.submitForm(e, 'Dropbox')}}
            color="primary">Submit</Button>
        </TabPane>
        </TabContent>
        
        {this.state.confirmCancel ? 
        <div style={{paddingTop:'0.5em'}}>
        <Button onClick={()=>{this.setState({confirmCancel: false})}}
        outline size="sm" color="primary">Never Mind</Button>
        <Button onClick={()=>{this.setState({redirect_to_root: true})}}
        style={{color:'#DC3545'}}
        size="sm" color="link">Confirm Cancel</Button>
        </div>
        :
        <div style={{paddingTop:'0.5em'}}>
        <Button onClick={()=>{this.setState({confirmCancel: true})}}
        size="sm" color="link">Cancel</Button>
        </div>
        }
        </Jumbotron>
        </div>
      );
    }
  }
}

const mapStateToProps = (state) => ({
  logged_in: state.logged_in,
  user_info: state.user_info,
  loading: state.loading
});

export default connect(mapStateToProps)(AdminVerification);