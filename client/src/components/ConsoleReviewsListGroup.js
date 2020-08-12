import React, { useState } from 'react';
import authorizeUser from '../Auth'
import { ButtonGroup, Button, Toast, ToastBody, ToastHeader, 
  Row, Col, Alert, Collapse, Badge } from 'reactstrap';
import Loading from './Loading'
import CivitasLogoSmall from '../img/CivitasLogoSmall.png';
import CivitasLogoSmallWhite from '../img/CivitasLogoSmallWhite.png';
import { FaCheckCircle } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';

const ConsoleReviewsList = props => {
  const [errMsg, setErrMsg] = useState("");

  const ApproveRejectRequest = (review_id, type) => {
    console.log('review details',review_id, type)
    let token = props.token;
    console.log(token)

    let apiendpoint = "/review"
    if (type === 'approve'){
      apiendpoint += "/approve";
    } else {
      apiendpoint += "/reject";
    }

    console.log(apiendpoint)
  
    authorizeUser(token, apiendpoint, {'review_id': review_id}, 'patch')
      .then(result => {
        console.log("result " + type + " request:",result)
        if (result){
          console.log(result)
          window.location.reload(false);
        }
        else {
          console.log('Error')
          setErrMsg("An error has occurred. Please refresh and try again.")
        }
      })
      .catch(error => {
        console.log(error)
        setErrMsg("An error has occurred. Please refresh and try again.")
      })
  }
  return(
    Object.keys(props.reviews).reverse().map(function(key) {
      return(
        <div key={key}  style={{display:'flex',justifyContent: 'center'}}>
        <Toast style={{width: '50em'}}>
        <Alert color="danger" isOpen={errMsg !== ''}>{errMsg}</Alert>

        {(key.toString() === (props.reviews.length - 1).toString()) ? 
          <ToastHeader>
          <Row>
            <Col style={{display:'flex',justifyContent: 'left'}}>
            Requester
            </Col>
            <Col style={{display:'flex',justifyContent: 'left'}}>
            Resolvers
            </Col>
            <Col style={{display:'flex',justifyContent: 'right'}}>
            {' '}
            </Col>
          </Row>
        </ToastHeader>
        : null }
          <ToastBody style={{paddingTop:'0', paddingBottom:'0.2em', 
            backgroundColor: props.type === 'completed' ?
              props.reviews[key].verification_status === 'approved' ? 
                '#E5FFEB' : '#FFEFF1'
              : 'white'}}>
            <Row>
              <Col style={{display:'flex',justifyContent: 'left'}}>
              {props.reviews[key].requester_username}
              </Col>
              <Col style={{display:'flex',justifyContent: 'left'}}>
                <Collapse isOpen={true}>
                  {Object.keys(props.reviews[key].resolvers_usernames).map(
                    function(resolver_key){
                      return(
                        <Row style={{display:'flex', justifyContent:'left'}}>
                          <div>
                          {props.reviews[key].resolvers_usernames[resolver_key]}
                          {' '}&nbsp;
                          </div>
                          <Badge pill 
                          color={props.type==='completed' ?
                            'secondary':
                            props.reviews[key].ratings[resolver_key] >= 4 ?
                            "success" :
                            props.reviews[key].ratings[resolver_key] >= 2 ?
                            "warning" : "danger"
                          } 
                          style={{ marginTop:'0.3em'}}> 
                          {' '} + {props.reviews[key].ratings[resolver_key]}
                          <img src={props.type==='completed' ?
                            CivitasLogoSmallWhite : CivitasLogoSmallWhite} 
                            style={{marginBottom:'0.2em', marginLeft:'0.2em'}}
                            width='10em'/>
                          </Badge>
                        </Row>
                      )
                    }
                  )}
                </Collapse>
              </Col>
              {props.type === 'pending' ? 
              <Col style={{display:'flex',justifyContent: 'right'}}>
                <Collapse isOpen={true}>
                <ButtonGroup>
                <Button size="sm"color="primary"
                  onClick={()=>{
                    ApproveRejectRequest(props.reviews[key]._id, 'approve')
                  }}>Approve</Button>
                <Button size="sm"color="danger"
                  onClick={()=>{
                    ApproveRejectRequest(props.reviews[key]._id, 'reject')
                  }}>Deny</Button>
                </ButtonGroup>
                </Collapse>
              </Col> : 
              <Col style={{display:'flex',justifyContent: 'right'}}>
              {props.reviews[key].verification_status} {' '}
              {props.reviews[key].verification_status === 'approved' ?
                <FaCheckCircle style={{padding:'0.1em',marginTop:'0.3em'}}/> : 
                <MdDelete style={{padding:'0',marginTop:'0.3em'}}/>
              }
              </Col>
              }
            </Row>
          </ToastBody>
        </Toast>
        </div>
      )
    })
  )
}

const ConsoleReviewsListGroup = props => {
  return (
    <div>
      <Collapse isOpen={props.show_reviews}>
        { props.pending_reviews.length !==
          props.pending_reviews_ids.length ||
          props.completed_reviews.length !==
          props.completed_reviews_ids.length ? 
          <div style={{paddingTop:'1em'}}>
            <Loading component="Reviews" 
              primary={true} relative={true}/>
          </div>
        :
        <div>
        <ConsoleReviewsList type="pending" 
          reviews={props.pending_reviews}
          ratings={props.ratings}
          token={props.token}
          dispatch={props.dispatch}
          group_id={props.group_id}/>
        <br/>
        {props.completed_reviews.length > 0 ?
        <h5>Completed</h5> : null }
        <ConsoleReviewsList type="completed" 
          reviews={props.completed_reviews}
          ratings={props.ratings}
          token={props.token}
          dispatch={props.dispatch}
          group_id={props.group_id}/>
        </div>

        }
      </Collapse>
    </div>
  )
}

export default ConsoleReviewsListGroup;