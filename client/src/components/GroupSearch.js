import React, { Component } from 'react';
import { Input, Toast, Row, ToastHeader, Col, 
  Alert, Fade} from 'reactstrap';
import authorizeUser from '../Auth';
import Button from 'reactstrap/lib/Button';
import ReactDOM from 'react-dom';

class GroupSearch extends Component {
  constructor(props){
    super(props);
    this.state = {
      search: "",
      show_results: true,
      results: [],
      result_group: 0,
      max_results: 10,
      errMsg: ""
    }
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  // Exit search if click outside
  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside, true);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside, true);
  }
  handleClickOutside = event => {
    const domNode = ReactDOM.findDOMNode(this);
    if (!domNode || !domNode.contains(event.target)) {
      this.setState({ show_results: false, max_results: 10 })
    }
  }
  handleChange = async (event) => {
    if (event.target.value === '') {
      this.setState({ results: [], max_results: 10 })
      return;
    } 
    this.setState({ search: event.target.value })
    authorizeUser(this.props.token, 
      '/group/query?search=' + event.target.value, null, 'get')
      .then(result => {
        console.log("result:",result)
        if (result){
          this.setState({ results: result.data.results, max_results: 10 })
        }
      })
      .catch(error => {
        console.log(error)
      })
  };
  join = (group_id) => {
    console.log('JOIN',group_id)
    let token = this.props.cookies.get('token');
    console.log(token)

    let apiendpoint = "/group/join/" + group_id
    console.log(group_id, apiendpoint)
    authorizeUser(token, apiendpoint, {}, 'patch')
      .then(result => {
        console.log("result join:",result)
        if (result){
          console.log(result)
          window.location.reload(false);
        }
        else {
          this.setState({errMsg: 
            "An error has occurred. Please refresh and try again."})
        }
      })
      .catch(error => {
        console.log(error)
        this.setState({errMsg: 
          "An error has occurred. Please refresh and try again."})
      })
  }
  request_to_join = (group_id) => {
    console.log('JOIN',group_id)
    let token = this.props.cookies.get('token');
    console.log(token)

    let apiendpoint = "/group/user_request/" + group_id
    console.log(group_id, apiendpoint)
    authorizeUser(token, apiendpoint, {}, 'patch')
      .then(result => {
        console.log("result request to join:",result)
        if (result){
          console.log(result)
          window.location.reload(false);
        }
        else {
          console.log('Error')
          this.setState({errMsg: 
            "An error has occurred. Please refresh and try again."})
        }
      })
      .catch(error => {
        console.log(error)
        this.setState({errMsg: 
          "An error has occurred. Please refresh and try again."})
      })
  }
  Result = props => {
    
    return(
      
      <div style={{display:'flex',justifyContent: 'left'}}>
        <Toast style={{width: '41.7em', 
          backgroundColor: props.joined ?'white':'lightgray'}}> 
          <ToastHeader>
          <Row>
            <Col style={{marginTop:'0.35em',
            paddingLeft:'1em', paddingRight:'1em'}}>
            {props.group.group_name}
            </Col>
            <Col style={{display:'flex',justifyContent: 'right'}}>
            {props.joined ? 
            <Button href={"/groups/"+props.group._id} 
              size="sm" color="primary">Go to Group</Button>
            : props.is_supervisor ?
            <Button  
            size="sm" color="warning">Must join as Regular User</Button>
            : props.requested ? 
            <Button disabled
            size="sm" color="warning">Requested</Button>
            : props.invited ? 
            <Button onClick={()=>{this.join(props.group._id)}}
            size="sm" color="success">Invited! Join</Button>
            :
            <Button size="sm" color="danger" 
              onClick={()=>{this.request_to_join(props.group._id)}}>
              Request to Join</Button>}
            </Col>
          </Row>
          </ToastHeader>
        </Toast>
      </div>
    )
  }
  render() {

    return (
      <div style={{width:'37em', textAlign:'left', padding:'0'}}>
        <Col style={{paddingLeft:'0', paddingTop:'0.5em'}}>
        
        <div style={{display:'flex', justifyContent:'center'}}>
          <Alert style={{fontSize:'12px', maxWidth:'30em'}} 
            isOpen={this.state.errMsg !== ''} color="danger">
            {this.state.errMsg}</Alert>
        </div>
        
        <div style={{display:'flex', justifyContent:'center'}}>
        <Input onClick={()=>{this.setState({ show_results: true })}} 
          type="text" name="search" placeholder="Search groups" 
          onChange={(e) => { this.handleChange(e) }}/>
        </div>

        <div style={{display:'flex', justifyContent:'left'}}>
        <Col style={{height:'1em', padding:'0'}}>
        <Fade in={this.state.search !== '' && this.state.show_results}
          style={{fontSize:'12px'}}>
          {this.state.results.length} {this.state.results.length === 1 ?
          ' result' : ' results'}
        </Fade>
        { this.state.show_results ? 
          Object.keys(this.state.results).map(function(key) {
            return (
              key < (this.state.max_results - 1) ?
              <div key={key} style={{paddingBottom: 
                key.toString() === (this.state.results.length - 1).toString()
                 ? '6em' : '0'}}>
               
              {this.Result({
                group:this.state.results[key],
                is_supervisor: this.props.is_supervisor,
                joined:this.props.group_ids.indexOf(this.state.results[key]._id)
                  !== -1 ? true : false,
                requested:
                  this.props.requested_to_join_groups_ids.indexOf(
                    this.state.results[key]._id) !== -1 ? true : false,
                invited:
                  this.props.invited_groups_ids.indexOf(
                    this.state.results[key]._id) !== -1 ? true : false,
              })}

              </div> : null 
            );
          }.bind(this)) : null}

        {!this.state.show_results || 
        (this.state.max_results >= this.state.results.length) ? null :
        <div style={{display:'flex', justifyContent:'center', 
          paddingTop:'0.5em', paddingBottom: '4em'}}>
          <Button color="light" size="sm"
            onMouseEnter={()=>{
              this.setState({max_results: this.state.max_results + 10})
            }}
            onClick={()=>{
              this.setState({max_results: this.state.max_results + 10})
            }}
            >See More...</Button>
        </div> }
        </Col>
        </div>

        </Col>
      </div>
    );
  }
}



export default GroupSearch;