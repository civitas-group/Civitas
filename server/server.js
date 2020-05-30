const express = require('express');
const cors = require('cors');
const PORT = 8080;
const app = express();
app.use(cors());
app.use(express.json());


const bodyParser = require('body-parser');

// Routes
const postRouter = require('./src/routes/post.router');

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

app.use('/posts', postRouter);



// listen
app.listen(PORT, function () {
    console.log(`Server Listening on ${PORT}`);
});

