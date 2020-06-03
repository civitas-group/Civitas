const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();


// mongoose options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};

mongoose.connect(process.env.ATLAS_CITY1_URI, options);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongodb Connection Error: ' + process.env.ATLAS_CITY1_URI));
db.once('open', () => {
     console.log('MongoDB Connection Successful');
});
