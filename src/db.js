// db.js

const mongoose = require('mongoose');

// user scheme
const userSchema = mongoose.Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  username: {type: String, unique: true, required: true},
  password: {type: String, required: true}
});

// sketch scheme
const sketchSchema = mongoose.Schema({
  name: {type: String, required: true},
  caption: {type: String},
  tags: {type: String},
  dateCreated: {type: Date},
  userId: {type: mongoose.Schema.Types.ObjectId, required: true, ref: 'userSchema'}
});


// register schemas
mongoose.model("User", userSchema);
mongoose.model("Sketch", sketchSchema);

// connect to database
mongoose.connect('mongodb://localhost/final-project',  {useNewUrlParser: true});
