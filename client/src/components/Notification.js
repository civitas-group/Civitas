import React, { useState } from 'react';
import { Row } from 'reactstrap';
import authorizeUser from '../Auth';
import { MdRadioButtonChecked } from 'react-icons/md';
import { RiCheckboxBlankCircleLine }  from 'react-icons/ri';
import Collapse from 'reactstrap/lib/Collapse';

const Notification = props => {
  const [readAction, setReadAction] = useState(props.read);
  const [marking, setMarking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [fullNotification, setFullNotification] 
    = useState(props.is_main_page ? true : false);

  const mark = () => {
    if (marking) return;
    setMarking(true);
    let token = props.token;
    let read = props.read ? 'false' : 'true';
    let apiendpoint = "/notifications/mark?index=" 
      + props.index +  "&read=" + read

    authorizeUser(token, apiendpoint, {}, 'patch')
      .then(async result => {
        console.log("result mark:",result)
        if (result){
          // get updated notifs for redux update   
          await authorizeUser(token, '/authorize')
            .then(async result => {
              if (result){
                await props.dispatch({ 
                  type: 'NOTIFICATIONS_MARK_RELOAD',
                  index: props.index,
                  value: {
                    read: !props.read,
                    content: props.content
                  },
                  increment: props.read ? 1 : -1
                });
                setMarking(false);
                setReadAction(!readAction)
              }
              else {
                console.log('Error marking notification')
                setMarking(false);
              }
            })
            .catch(error => {
              console.log(error)
              props.dispatch({ type: 'LOGOUT' });
              setMarking(false);
            })
        }
        else {
          console.log('Error marking notification')
          setMarking(false);
        }
      })
      .catch(error => {
        console.log(error)
        setMarking(false);
      })
  }

  return (
    <div style={{whiteSpace:'pre-wrap', 
      width: props.is_main_page ? '39em':'26em'}}
      onMouseEnter={()=>{setShowDetails(true);}}
      onMouseLeave={()=>{setShowDetails(false);}}>
      <div style={{paddingLeft:'1.2em'}}>
        <Row onClick={()=>{setFullNotification(!fullNotification)}}>
          <a onClick={mark} 
            onMouseEnter={()=>{setReadAction(!props.read)}}
            onMouseLeave={()=>{setReadAction(props.read)}}
            size="sm" color="link" id="mark"
            style={{paddingLeft:'0.8em', opacity: marking ? '30%' : '100%',
            visibility: showDetails ? 'visible' : 'hidden' }}>
            {readAction ? <MdRadioButtonChecked style={{padding: '0'}}/>
              : <RiCheckboxBlankCircleLine style={{padding: '0'}}/> }
          </a>
          <p style={{maxWidth: props.is_main_page ? '36em':'23em',
            textOverflow: 'ellipsis', 
            overflow: 'hidden', whiteSpace: 'nowrap', 
            margin: '0', paddingLeft: '0.5em'}}>
            {fullNotification ? '...' : 
              props.read ? props.content : <b>{props.content}</b>}
          </p>
          <div style={{paddingLeft:'2.3em', textAlign:'left'}} >
            <Collapse isOpen={fullNotification}
              onClick={()=>{setFullNotification(false)}}>
              {props.content} 
            </Collapse>
          </div>
        </Row>
      </div>
    </div>
  )
}

export default Notification;
