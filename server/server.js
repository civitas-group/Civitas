const express = require('express');
const cors = require('cors');
const path  = require('path');
const PORT = 8080;
const app = express();
app.use(cors());
app.use(express.json());


const bodyParser = require('body-parser');

// Routes
const baseRouter = require('./src/routes/base.router');
const postRouter = require('./src/routes/post.router');
const signUpRouter = require('./src/routes/signup.router');

const SESSION_DURATION = 1000 * 60 * 60// 1 hour

const CLIENT_BUILD_PATH = path.join(__dirname, "../client/build");
require('./src/database');


app.get('/', (req, res) => {
    res.send("<Server>");
});

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(bodyParser.json());
app.use('/', baseRouter);
app.use('/api/posts', postRouter);
app.use('/api/signup', signUpRouter);


// listen
app.listen(PORT, function () {
    console.log(`Server Listening on ${PORT}`);
});

