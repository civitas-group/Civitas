import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Redirect, withRouter } from 'react-router';
import Loading from './components/Loading'
import authorizeUser from './Auth'
import { Button, Jumbotron, Badge, Row, Input, Dropdown,
  DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap';
import Tags from './Tags'
import CreatePost from './components/CreatePost'
import Announcements, { CreateAnnouncement } from './Announcements';

class Group extends Component {
  state = {
    shown_posts: [],
    posts: [],
    announcements: [],
    tags: [],
    redirect_to_root: false,
    group_name: "",
    group_id: "",
    post_body_error: false,
    post_title_error: false,
    can_show_more_posts: false,
    posts_for_search: [],
    search_text: '',
    tags_dropdown: false,
    chosen_tags: [],
    no_tags_selected: true,
    supervisor_id: '',
    user_ids: [],
  };

  POST_PAGE_SIZE = 10;

  getUsersInfo = () =>{
    let token = this.props.cookies.get('token');
    let endpoint = '/group/' + this.props.match.params.group_id + '/users';
    let req_body = {
      'user_ids': this.state.user_ids
    }
    authorizeUser(token, endpoint, req_body)
      .then(result => {
        if (result){
          this.props.dispatch({
            type: 'GROUP_USERS_MAP_ADD',
            payload: result.data.users
          })
        }
        else {
          console.log('Error: no users info found.')
          this.props.dispatch({ type: 'LOGOUT' });
        }
      })
      .catch(error => {
        console.log(error)
        this.props.dispatch({ type: 'LOGOUT' });
      });
  } 

  componentDidMount() {
    this.props.dispatch({ type: 'LOADING' });
    const { cookies } = this.props;
    let token = cookies.get('token');
    let endpoint = '/group/' + this.props.match.params.group_id;
    authorizeUser(token, endpoint)
      .then(result => {
        if (result){
          if (!result.data.group_ids.includes(this.props.match.params.group_id)
            && !result.data.managed_groups_ids.includes(this.props.match.params.group_id)
            && !result.data.is_super_admin){
            this.setState({redirect_to_root:true})
            return;
          }

          let tags_mapped = {}
          for (let i = 0; i < result.data.posts.length; ++i){
            tags_mapped = {};
            for (let j = 0; j < result.data.posts[i].tags_info.length; ++j){
              tags_mapped[result.data.posts[i].tags_info[j]['tag_name']] = null;
            }
            result.data.posts[i].tags_mapped = tags_mapped;
          }
          this.setState({
            shown_posts: result.data.posts.length > this.POST_PAGE_SIZE ? result.data.posts.slice(0, this.POST_PAGE_SIZE) : result.data.posts,
            save_posts_for_search: result.data.posts,
            posts: result.data.posts.length > this.POST_PAGE_SIZE ? result.data.posts.slice(this.POST_PAGE_SIZE) : [],
            can_show_more_posts: result.data.posts.length > this.POST_PAGE_SIZE ? true : false,
            announcements: result.data.announcements,
            tags: result.data.tags,
            group_name: result.data.group_name,
            group_id: this.props.match.params.group_id,
            user_ids: result.data.user_ids.
              concat(result.data.cosupervisor_ids).
              concat([result.data.supervisor_id])
          });
          delete result.data.posts;
          if (result.data.hasOwnProperty('announcements')) {
            delete result.data.announcements;
          }

          this.getUsersInfo()
          this.props.dispatch({
            type: 'GROUP_ACCESS',
            payload: Object.assign(result.data, {
              group_id: this.props.match.params.group_id
            })});
        }
        else {
          console.log('Error: no result on mount.')
          this.props.dispatch({ type: 'LOGOUT' });
        }
      })
      .catch(error => {
        console.log(error)
        try{
          if (error.response.data.error === "Invalid group"){
            this.setState({redirect_to_root:true})
          }
        }
        catch {
          this.props.dispatch({ type: 'LOGOUT' });
        }
        
      });
      console.log("MOUNTED STATE: ", this.state);
  }

  showMorePosts = () => {
    var new_shown_posts = [], new_posts = [];
    var new_can_show_more_posts;
    if (this.state.posts.length > this.POST_PAGE_SIZE) {
      new_shown_posts = this.state.shown_posts.concat(this.state.posts.slice(0, this.POST_PAGE_SIZE));
      new_posts = this.state.posts.slice(this.POST_PAGE_SIZE);
      new_can_show_more_posts = true;
    } else {
      new_shown_posts = this.state.shown_posts.concat(this.state.posts);
      new_posts = [];
      new_can_show_more_posts = false;
    }

    this.setState({
      shown_posts: new_shown_posts,
      posts: new_posts,
      can_show_more_posts: new_can_show_more_posts
    });
  }
  handleSearch = async (event) => {
    const { target } = event;
    let value = target.value.toLowerCase();
    let title = ''
    let found_posts = []
    await this.setState({ search_text: value })
    if (this.state.no_tags_selected){
      for (let i = 0; i < this.state.save_posts_for_search.length; ++i){
        title = this.state.save_posts_for_search[i].title.toLowerCase();
        if(title.includes(value)){
          found_posts.push(this.state.save_posts_for_search[i])
        }
      }
    } else {
      let tags_found;
      for (let i = 0; i < this.state.save_posts_for_search.length; ++i){
        title = this.state.save_posts_for_search[i].title.toLowerCase();
        if(title.includes(value) || value === ''){
          tags_found = true;
          for (let j = 0; j < this.state.chosen_tags.length; ++j){
            //console.log(this.state.chosen_tags[j], this.state.tags[j].key)
            if (this.state.chosen_tags[j] &&
              !this.state.save_posts_for_search[i].tags_mapped.hasOwnProperty(this.state.tags[j].key)){
              tags_found = false;
            }
          }
          if (tags_found) {
            found_posts.push(this.state.save_posts_for_search[i])
          }
        }
      }
    }

    await this.setState({ 
      posts: found_posts.length > this.POST_PAGE_SIZE ? found_posts.slice(this.POST_PAGE_SIZE) : [],
      shown_posts: found_posts.length > this.POST_PAGE_SIZE ? found_posts.slice(0, this.POST_PAGE_SIZE) : found_posts,
      can_show_more_posts: found_posts.length > this.POST_PAGE_SIZE ? true : false,
    })
  };
  toggleChooseTag = async (index) => {
    if (this.state.chosen_tags.length !== this.state.tags.length){
      await this.setState({ chosen_tags: 
        Array.from({length: this.state.tags.length}).map(x => false) })
    }
    let temp_chosen_tags = this.state.chosen_tags;
    temp_chosen_tags[index] = !temp_chosen_tags[index];
    await this.setState({ chosen_tags: temp_chosen_tags })
    if (this.state.chosen_tags.indexOf(true) === -1){
      if (!this.state.no_tags_selected){
        await this.setState({ no_tags_selected: true })
      }
    } else {
      if (this.state.no_tags_selected){
        await this.setState({ no_tags_selected: false })
      }
    }
    await this.handleSearch({
      'target': { 'value': this.state.search_text }
    })
  } 
  render() {
    if (this.props.loading){
      return (<Loading component="Group"/>);
    }
    else if (!this.props.logged_in || this.state.redirect_to_root){
      return (<Redirect to="/" />);
    }
    else {
      return (
        <div>
          <Jumbotron style={{paddingTop:'0'}}>
            <h1 className="display-5">{this.state.group_name}</h1>
            <p><Badge color="primary" pill>Private</Badge></p>
            <Announcements
              dispatch={this.props.dispatch}
              cookies={this.props.cookies}
              group_id= {this.props.match.params.group_id}
              is_supervisor={this.props.user_info.is_supervisor}
              announcements={this.state.announcements}/>
            <h4>Posts</h4>
            <Row style={{paddingLeft:'1em'}}>
            <CreatePost 
              tags={this.state.tags} 
              is_request={false}
              group_id={this.state.group_id}
              username={this.props.user_info.username}
              cookies={this.props.cookies}/>
            <CreatePost 
              tags={this.state.tags} 
              is_request={true}
              group_id={this.state.group_id}
              username={this.props.user_info.username}
              cookies={this.props.cookies}/>
            { this.props.user_info.is_supervisor ?
            <CreateAnnouncement group_id={this.state.group_id}
              username={this.props.user_info.username}
              cookies={this.props.cookies}/> : null }
            </Row>
            
            { this.props.user_info.is_supervisor ?
            <Tags tags={this.state.tags} 
              group_id={this.state.group_id}
              username={this.props.user_info.username}
              cookies={this.props.cookies}/>
            : null }
            
            <Row style={{paddingLeft:'0.9em'}}>
            <Input type="text" name="search_text" 
              style={{width:'36.2em', backgroundColor: '#E9ECEF'}}
              placeholder="Search Posts"
              onChange={(e) => { this.handleSearch(e) }}/>
            
            <Dropdown isOpen={this.state.tags_dropdown} 
              toggle={()=> {this.setState({ 
                tags_dropdown: !this.state.tags_dropdown
              })}}>
              <DropdownToggle caret color="info">
                Search Tags
              </DropdownToggle>
              <DropdownMenu right>
                
                { Object.keys(this.state.tags).map(function(key) {
                  return (
                    <DropdownItem toggle={false} key={key} 
                      onClick={()=>{this.toggleChooseTag(key)}}
                      style={{backgroundColor:
                        this.state.chosen_tags[key] ? '#219CB0':'white'}}>
                      {this.state.tags[key].key}
                      
                    </DropdownItem>
                  );
                }.bind(this))}
              </DropdownMenu>
            </Dropdown>
            </Row>

            {this.props.children && React.cloneElement(this.props.children, {
              announcements: this.state.announcements,
              posts: this.state.shown_posts,
              group_id: this.props.match.params.group_id,
              username: this.props.user_info.username,
              user_info_map: this.state.user_info_map,
              cookies: this.props.cookies
            })}
          </Jumbotron>
          {this.state.can_show_more_posts ? 
            <div style={{display:'flex', justifyContent:'center', 
              paddingTop:'0.5em', paddingBottom: '4em'}}>
              <Button color="light" size="sm" onClick={this.showMorePosts}>
                See More...
              </Button>
            </div>
            :
            <div style={{display:'flex', justifyContent:'center', 
              paddingTop:'0.5em', paddingBottom: '4em'}}>
              <h4>No more posts to show!</h4>
            </div>
          }
          
        </div>
      );
    }
  }
}

const mapStateToProps = (state) => ({
    logged_in: state.logged_in,
    user_info: state.user_info,
    loading: state.loading,
    refetch_page: state.refetch_page,
    group_users_map: state.group_users_map,
    group_users_loading: state.group_users_loading
});
  
export default withRouter(connect(mapStateToProps)(Group));
