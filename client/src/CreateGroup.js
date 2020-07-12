import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { connect } from 'react-redux'
import { Row, Form, FormGroup, Input, Button, 
  Alert, Jumbotron } from 'reactstrap';
import Loading from './components/Loading';
import authorizeUser from './Auth';
import AdminVerification from './AdminVerification';
import { MdNavigateNext } from 'react-icons/md';

class CreateGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      group_name: "",
      group_address: "",
      error: "",
      result: {
        success: false,
        created_group: {}
      },
      localLoading: false,
      redirect_to_root: false,
      redirect_to_group: false,
      redirect_to_verify: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.submitForm = this.submitForm.bind(this);
  };

  componentDidMount() {
    this.props.dispatch({ type: 'LOADING' });
    const { cookies } = this.props;
    let token = cookies.get('token');
    
    authorizeUser(token, '/authorize')
      .then(result => {
        console.log("result:",result)
        if (result){
          this.props.dispatch({ 
            type: 'HOMEPAGE_ACCESS',
            payload: result.data });
            
            if (!this.props.user_info.is_supervisor){
              this.setState({redirect_to_root: true})
            }
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
  handleChange = async (event) => {
    const { target } = event;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const { name } = target;
    await this.setState({
      [name]: value,
    });
  }
  submitForm(e) {
    e.preventDefault();
    if (this.state.group_name === "") {
      this.setState({
        error: "Please enter a name for this new group."
      });
      return;
    } else if (this.state.group_address === ""){
      this.setState({
        error: "Please enter the address of the residential area this group is for."
      });
      return;
    }
    this.setState( { redirect_to_verify: true } )
  }
  render() {
    if (this.props.loading){
      return (<Loading />);
    }
    else if (!this.props.logged_in || this.state.redirect_to_root){
      return (<Redirect to="/" />);
    }
    else if (this.state.redirect_to_group){
      let endpoint = "/groups/" + this.state.result.created_group._id;
      return (<Redirect to={endpoint} />);
    }
    else if (this.state.redirect_to_verify){
      console.log(this.props.group_name)
      return (<AdminVerification
        cookies={this.props.cookies}
        group_name={this.state.group_name}
        group_address={this.state.group_address}/>);
    }
    else {
      return (
        <div  style={{padding:'2em'}}>
        <Jumbotron>
        <div style={{width:"50em"}}>
        <h4>Enter the name and address for your group.</h4>
        <Alert isOpen={this.state.error !== ""} color="danger">
        {this.state.error}
        </Alert>
        <Form className="form" onSubmit={(e) => this.submitForm(e)}>
        <FormGroup>
        <Input
          type="group_name"
          name="group_name"
          placeholder="Group name"
          onChange={(e) => {
          this.handleChange(e);
          }}/>
        <Input
          type="group_address"
          name="group_address"
          placeholder="Group Address"
          onChange={(e) => {
          this.handleChange(e);
          }}/>
        </FormGroup>
        { this.state.localLoading ? <Loading /> : null }
        <Button color="primary">Next 
          <MdNavigateNext style={{paddingBottom:'0.1em'}}/></Button>
        </Form>
        <Alert isOpen={this.state.result.success === true} color="primary">
          <Row>
          <h4>Group name: {this.state.result.created_group.group_name}</h4>
          </Row>
          <Row>
            <Button>Go Home</Button>
          </Row>
        </Alert>
        </div>
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

export default connect(mapStateToProps)(CreateGroup);