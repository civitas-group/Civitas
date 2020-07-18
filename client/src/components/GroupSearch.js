import React, { Component } from 'react';
import { Input, Toast, Row, ToastHeader, Col, Fade} from 'reactstrap';
import authorizeUser from '../Auth';
import Button from 'reactstrap/lib/Button';
import ReactDOM from 'react-dom';

const Result = props => {
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
          :<Button size="sm" color="danger">Request to Join</Button>}
          </Col>
        </Row>
        </ToastHeader>
      </Toast>
    </div>
  )
}

class GroupSearch extends Component {
  constructor(props){
    super(props);
    this.state = {
      search: "",
      show_results: true,
      results: [],
      result_group: 0,
      max_results: 10

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
  render() {

    return (
      <div style={{width:'37em', textAlign:'left', padding:'0'}}>
        <Col style={{paddingLeft:'0', paddingTop:'0.5em'}}>
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
              <div style={{paddingBottom: 
                key.toString() === (this.state.results.length - 1).toString()
                 ? '4em' : '0'}}>
               
              <Result key={key} group={this.state.results[key]}
                joined={this.props.group_ids.indexOf(this.state.results[key]._id)
                  !== -1 ? true : false}/>
                  
              </div> : null 
            );
          }.bind(this)) : null}

        {!this.state.show_results || 
        (this.state.max_results > this.state.results.length) ? null :
        <div style={{display:'flex', justifyContent:'center', paddingBottom: '4em'}}>
          <Button color="light" size="sm"
            onMouseEnter={()=>{
              this.setState({max_results: this.state.max_results + 10})
            }}
            onClick={()=>{
              this.setState({max_results: this.state.max_results + 10})
            }}
            >See More</Button>
        </div> }
        </Col>

        </div>
        </Col>
      </div>
    );
  }
}
  
export default GroupSearch;
