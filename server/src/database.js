const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();


// mongoose options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
};


let db_url = process.env.DB_DEV_URI;
process.argv.forEach(function (val, index, array) {
  if (val == 'prod'){
	  db_url = process.env.DB_PROD_URI;
  }
});

mongoose.connect(process.env.DB_PROD_URI, options);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Mongodb Connection Error: ' + process.env.DB_PROD_URI));
db.once('open', () => {
	if (db_url == process.env.DB_DEV_URI) {
		console.log('Running on development database');
	} else {
		console.log('*****Running on production database*****');
	}
    console.log('MongoDB Connection Successful');
});
