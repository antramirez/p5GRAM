// db.js

const mongoose = require('mongoose');

// user scheme
const userSchema = mongoose.Schema({
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  userName: {type: String, required: true},
  password: {type: String, required: true}, // hashed
  sketches: [SketchSchema] // array of sketches
});

// sketch scheme
const sketchSchema = mongoose.Schema({
  name: {type: String, required: true},
  caption: {type: String},
  tags: {type: String},
  dateCreated: {type: Date}
});


// register schemas
mongoose.model("User", userSchema);
mongoose.model("Sketch", sketchSchema);

// connect to database
mongoose.connect('mongodb://localhost/final-project',  {useNewUrlParser: true});
