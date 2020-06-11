import axios from 'axios';

async function authorizeUser(token) {
    let fulltoken = 'Bearer ' + token;
    let apiurl = 'http://localhost:8080/api/authorize';
    const options = {
        method: 'post',
        url: apiurl,
        headers: { 'Content-Type': 'application/json', 
        'authorization': fulltoken, 
        'Access-Control-Allow-Origin': 'http://localhost:3000/*' }
      };
    return new Promise((resolve, reject) => {
        axios(options).then((response) => {
            console.log("Auth.js res1:", response)
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
            console.log("fulltoken", fulltoken);
            reject(error);
        });
    });
}

export default authorizeUser;