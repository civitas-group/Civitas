import axios from 'axios';

async function authorizeUser(token, endpoint, body={}, type='post') {
    let fulltoken = 'Bearer ' + token;
    let apiurl = '';
    if (process.env.NODE_ENV  === 'development') {
        apiurl = 'http://localhost:8080/api' + endpoint;
    }
    else { 
        apiurl = process.env.REACT_APP_AWS_URL + '/api' + endpoint; 
    }
    const options = {
        method: type,
        url: apiurl,
        headers: { 
            'Content-Type': 'application/json', 
            'authorization': fulltoken, 
            'Access-Control-Allow-Origin': 'http://localhost:3000/*' 
        },
        data: body
      };
    return new Promise((resolve, reject) => {
        axios(options).then((response) => {
            resolve(response);
        })
        .catch((error) => {
            // Error
            console.log(error)
            if (error.response) {
                console.log('Request was made, server responded with status code outside 2xx', 
                error.response)
            } else if (error.request) {
                console.log('The request was made but no response was received', 
                error.request)
            } else {
                console.log('Error', error.message);
            }
            reject(error);
        });
    });
}

export default authorizeUser;