import React, { Component } from 'react';
import { Redirect } from 'react-router';
import { connect } from 'react-redux'
import {
  Row, Col, Form,
  FormGroup, Input,
  Button, Alert
} from 'reactstrap';
import Loading from './components/Loading'
import authorizeUser from './Auth'


class CreateGroup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      group_name: "",
      error: "",
      result: {
        success: false,
        created_group: {}
      },
      localLoading: false,
      redirect_to_root: false,
      redirect_to_group: false
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
        error: "Please enter a name for this new group.",
        localLoading: true
      });
      return;
    }

    let token = this.props.cookies.get('token');
    let req_body = { "group_name": this.state.group_name }
    authorizeUser(token, '/group/create', req_body)
      .then(result => {
        console.log("result:",result)
        let data = result['data'];
        console.log(data)
        if ('created_group' in data === false) {
          this.setState({ error: 
            "Response was okay, but no group was created. Please try again!",
            localLoading: false, 
          });
        } else {
          console.log("CREATED GROUP: ", data['created_group']);
          this.setState({
            result: {
              success: true,
              created_group: data['created_group']
            },
            redirect_to_group:true,
            localLoading: false, 
          });
        }
      })
      .catch(error => {

        console.log('There was an error!', error, typeof error.response.status);
        if (error.response.status === 409){
          this.setState({error: "Group already exists, please try again!",
          localLoading: false, });
        }
        else if ('error' in error) {
          this.setState({error: error['error'], localLoading: false, });
        } else {
          this.setState({error: "An unknown error has occured, please try again!",
            localLoading: false, });
        }
        console.log(this.state.error);
      })
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
    else {
      return (
      <div className="App1">
        <Alert isOpen={this.state.error !== ""} color="danger">
        {this.state.error}
        </Alert>
        <Form className="form" onSubmit={(e) => this.submitForm(e)}>
        <Col>
          <FormGroup>
          <Input
            type="group_name"
            name="group_name"
            id="example_group_name"
            placeholder="Group name"
            onChange={(e) => {
            this.handleChange(e);
            }}
          />
          </FormGroup>

        </Col>
        { this.state.localLoading ? <Loading /> : null }
        <Button>Submit</Button>
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