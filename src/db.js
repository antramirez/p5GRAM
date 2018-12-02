// db.js

const mongoose = require('mongoose');

// user schema
const userSchema = mongoose.Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  username: {type: String, unique: true, required: true},
  password: {type: String, required: true}
});

// sketch schema
const sketchSchema = mongoose.Schema({
  name: {type: String, required: true},
  caption: {type: String},
  tags: {type: String},
  src: {type: String},
  userId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'userSchema'}
});


// register schemas
mongoose.model("User", userSchema);
mongoose.model("Sketch", sketchSchema);


// is the environment variable, NODE_ENV, set to PRODUCTION?
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 const fs = require('fs');
 const path = require('path');
 const fn = path.join(__dirname, 'config.json');
 const data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
// conenction string appropriately!
const conf = JSON.parse(data);
dbconf = conf.dbconf;
} else {
// if we're not in PRODUCTION mode, then use
dbconf = 'mongodb://localhost/ar4477';
}

// connect to database
mongoose.connect(dbconf,  {useNewUrlParser: true});
