import React, { useState } from 'react';
import authorizeUser from './Auth'
import { Button, Modal, ModalHeader, ModalBody,
  CardText, CardBody, Input } from 'reactstrap';
import { RiEditBoxLine } from 'react-icons/ri'

const Tags = (props) =>  {
  const [tags, setTags] = useState(props.tags);
  const [tagsModal, setTagsModal] = useState(false);
  const [addTagText, setAddTagText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleTagsModal = () => { 
    if (!tagsModal){
      setTags(props.tags)
      setTagsModal(true)
    } else {
      setTagsModal(false)
    }
  }
  const handleChange = async (event) => {
    const { target } = event;
    let value = target.value;
    await setAddTagText(value)
    console.log(addTagText)
  };
  const submitNewTags = () => {
    setSubmitting(true);
    let new_tags = []
    for (let i = 0; i < tags.length; ++i){
      new_tags.push(tags[i].key)
    }
    let req_body = {
      'group_id': props.group_id,
      'tag_names': new_tags
    };
    let endpoint = "/tag/edit_group_tags";
    let token = props.cookies.get('token');
    authorizeUser(token, endpoint, req_body, 'patch')
      .then(result => {
        console.log("result edit tags:",result)
        if (result){
          toggleTagsModal();
          window.location.reload(false);
        }
        else {
          console.log('Error: no result on mount.', result)
          window.location.reload(false);
        }
      })
      .catch(error => {
        console.log(error)
        window.location.reload(false);
      })
  }

  const removeTag = index => {
    let temp_tags = [];
    for (let i = 0; i < tags.length; ++i){
      if (i.toString() !== index) temp_tags.push(tags[i]);
    }
    setTags(temp_tags)
  }
  const addTag = value => {
    let temp_tags = [];
    for (let i = 0; i < tags.length; ++i){
      temp_tags.push(tags[i]);
    }
    temp_tags.push({
      'key': value,
      'post_ids': []
    });
    setTags(temp_tags)
  }
  return (
    <div>
      <Button color="link" size="sm" onClick={toggleTagsModal}>
        <RiEditBoxLine style={{marginBottom:'0.2em'}}/>
        Edit Allowed Post Tags</Button>

      <Modal isOpen={tagsModal} toggle={toggleTagsModal} style={{opacity:"0.9"}}>
        <ModalHeader>Allowed Tags for Users</ModalHeader>
        <ModalBody>
        { Object.keys(tags).map(function(key) {
          return (
            <CardBody key={key} style={{padding:'0.1em', paddingLeft:'1em'}}>
              <Button onClick={()=>{removeTag(key)}} close />
              <CardText>{tags[key].key}</CardText>
            </CardBody>
          );
        })}
        <div style={{padding:'0.75em'}}>
          <Input type="text" name="add_tag_text" placeholder="Add Tag"
            onChange={(e) => { handleChange(e) }}/>
          <Button color="info" size="sm" disabled={addTagText === ''}
            onClick={()=>{ addTag(addTagText) }}>
            Add
          </Button>
        </div>
        <br/>
        <Button color="link" style={{color:'#219CB0'}} disabled={submitting} 
          onClick={toggleTagsModal}>Cancel</Button>
        <Button color="info" onClick={submitNewTags} disabled={submitting}>
          Submit Edits</Button>
        </ModalBody>
      </Modal>
    </div>
  );

}

export default Tags;