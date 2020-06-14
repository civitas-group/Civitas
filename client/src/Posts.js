import React, { Component } from 'react';
import { Toast, ToastBody, ToastHeader, Badge, Button} from 'reactstrap';

class Posts extends Component {
  render() {
    let posts = this.props.posts;

    return (
      <div id="Posts">
          <h4>Posts</h4>
          { Object.keys(posts).map(function(key) {
            return (
              <div key={key} className="p-3 my-2 rounded">
                <Toast>
                <ToastHeader>
                  <h6> { posts[key].title }</h6>
                  <span>{ posts[key].author }</span>
                </ToastHeader>
                <ToastBody>
                  <p>
                  { posts[key].body }
                  </p>
                </ToastBody>

                </Toast>
                <Button color="light" size="sm">Likes
                <Badge color="primary" pill> {posts[key].likes}</Badge>
                </Button>
              </div>
            );
        })}
      </div>
    );


  }
}

export default Posts;