const express = require('express');
const cors = require('cors');
const path  = require('path');
const PORT = 8080;
const app = express();
app.use(cors());
app.use(express.json());

const bodyParser = require('body-parser');

// Routes
const postRouter = require('./src/routes/post.router');
const commentRouter = require('./src/routes/comment.router');
const signUpRouter = require('./src/routes/signup.router');
const authRouter = require('./src/routes/auth.router');
const accountRouter = require('./src/routes/account.router');
const groupRouter = require('./src/routes/group.router');
const devRouter = require('./src/routes/dev.router');
const announcementRouter = require('./src/routes/announcement.router');
const notificationRouter = require('./src/routes/notification.router');
const userRouter = require('./src/routes/user.router');

const SESSION_DURATION = 1000 * 60 * 60// 1 hour

const CLIENT_BUILD_PATH = path.join(__dirname, "../client/build");
require('./src/database');

app.get('/', (req, res) => {
    res.send("<Server>");
});

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use('/api/users', userRouter)
app.use('/api/notifications', notificationRouter);
app.use('/api/announcements', announcementRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/signup', signUpRouter);
app.use('/api/account', accountRouter);
app.use('/api/authorize',authRouter);
app.use('/api/group', groupRouter);
app.use('/api/dev', devRouter);

// listen
app.listen(PORT, function () {
    console.log(`Server Listening on ${PORT}`);
});

