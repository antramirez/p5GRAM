// require express and path modules, and make an express app
const express = require('express');
// require mongoose module to connect to database
const mongoose = require('mongoose');
require('./db');

// require session module
const session = require('express-session');

const path = require('path');
const auth = require('./auth.js');

// require modules to upload files and alter the file system
const multer = require('multer');
const mkdirp = require('mkdirp');
const fs = require('fs');

const app = express();

// register schemas
const User = mongoose.model('User');
const Sketch = mongoose.model('Sketch');

// set session options middleware
app.use(session({secret: 'secret message', saveUninitialized: false, resave: false}));

app.set('view engine', 'hbs');

// full path relative to public
const fullPath = path.join(__dirname, 'public');

// set temporary directory to store images when they are uploaded
const upload = multer({
  dest: fullPath + '/img/tmp'
});

// set middleware to serve static content relative to public directory
app.use(express.static(fullPath));

// body parsing middleware
app.use(express.urlencoded({extended: false}));

// res locals middleware
app.use((req, res, next) => {
  // set local variable user to session user
  res.locals.user = req.session.user;
  next();
});

// paths
app.get('/', (req, res) => {
  // check if user is logged in
  if (!req.session.user) {
    res.render('home');
  }
  else {
    res.redirect('/create');
  }
});

app.get('/register', (req, res) => {
  // check if user is logged in
  if (!req.session.user) {
    res.render('register');
  }
  else {
    res.redirect('/create');
  }
})

app.post('/register', (req, res) => {
  // call register function with form's fields as paramters
  auth.register(req.body.firstName, req.body.lastName, req.body.username, req.body.password,
  // error callback
  (errObj) => {
    res.render('register', {message: errObj.message});
  },
  // success call back
  (user) => {
    auth.startAuthenticatedSession(req, user, () => {
      // set session user to user who just registered and redirect to home
      req.session.user = user;
      // create a directory for the user's uploads
      mkdirp(fullPath + '/img/uploads/' + req.session.user.username);
      res.redirect('/');
    });
  });
});

app.get('/login', (req, res) => {
  // check if user is logged in
  if (!req.session.user) {
    res.render('login');
  }
  else {
    res.redirect('/create');
  }
});

app.post('/login', (req, res) => {
  // log in user using login form
  auth.login(req.body.username, req.body.password,
  // error call back
  (errObj) => {
    // display error message above form
    res.render('login', {message: errObj.message});
  },
  // success call back
  (user) => {
    auth.startAuthenticatedSession(req, user, () => {
      // set session user to logged in user
      req.session.user = user;
      // redirect to user's sketches
      res.redirect('/'+ user.username +'/sketches');
    });
  });
})

app.get('/:username/sketches', (req, res) => {
  // check if user is logged in
  if (!req.session.user) {
    res.render('login');
  }
  else {
    // see if username exists
    User.findOne({username: req.params.username}, (err, user, count) => {
      if (user) {
        // now see if user has any sketches
        Sketch.find({userId: user._id}, (err, sketches, count) => {
            res.render('user-single', {username: req.params.username, sketches: sketches.reverse()});
        });
      }
      // print message is user does not exist
      else {
        res.render('user-single', {message: "USER DOES NOT EXIST"});
      }
    });
  }
});

// search for user
app.post('/:username/sketches', (req, res) => {
  // send to user page
  res.redirect('/' + req.body.username + '/sketches')
});

app.get('/add', (req, res) => {
  // check if user is logged in
  if (!req.session.user) {
    res.redirect('/login');
  }
  else {
    res.render('add');
  }
});

// handler for when user uploads image
app.post("/add", upload.single("file"), (req, res) => {

    // get extension of image uploaded
    const extension = path.extname(req.file.originalname).toLowerCase();

    // get file's temporary path where it was uploaded to
    const tempPath = req.file.path;
    const tempPathArr = tempPath.split('/');

    // multer's file.path creates a unique name for files, so use that to name the image
    const newFileName = tempPathArr[tempPathArr.length - 1];

    // create desired path, consisting of username and unique file name
    const targetPath = path.join(fullPath + '/img/uploads/' + req.session.user.username + '/' + newFileName + extension);

    // make sure image is a PNG or JPG
    if (extension === ".png" || extension === ".jpg") {
      fs.rename(tempPath, targetPath, err => {
        // print error message if something goes wrong, or else take user to homepage
        if (err) {
          res.render('/add', {message: "SOMETHING WENT WRONG"});
        }
        else {
          // extract tags
          const tags = req.body.tags.split(' ');

          // create a new sketch using forms' fields
          new Sketch({
            name: req.body.name,
            caption: req.body.caption,
            tags: tags,
            name: req.body.name,
            src: '/img/uploads/' + req.session.user.username + '/' + newFileName + extension,
            userId: res.locals.user._id
          }).save(function(err, result, count) {
            // if error saving sketch, create error object to log message
            if (err) {
              // console.log('err');
              app.render('/add', {message: "COULD NOT SAVE SKETCH"})
            }
          });
          // redirect user to their page with the new image
          res.redirect('/'+ res.locals.user.username +'/sketches');
        }
      });
    }
    // if image is not valid, remove temporary path and print error message
    else {
      fs.unlink(tempPath, err => {
        if (err) {
          res.render('add', {message: "ONLY .PNG AND .JPG FILES ARE ALLOWED"});
        }
        else {
          res.render('/', {message: "SOMETHING WENT WRONG"});
        }
      });
    }
  }
);

app.get('/create', (req, res) => {
  // check if user is logged in
  if (!req.session.user) {
    res.redirect('/login');
  }
  else {
    res.render('create');
  }
});

app.get('/settings', (req, res) => {
  // check if user is logged in
  if (!req.session.user) {
    res.redirect('/login');
  }
  else {
    res.render('settings');
  }
});

app.post('/settings', (req, res) => {
  // call update function
  auth.updateUser(req.body.firstName, req.body.lastName,
  (errObj) => {
    // if there is an error, display message above the form
    res.render('settings', {message: errObj.message})
  },
  () => {
    User.updateOne({_id: res.locals.user._id},
      // set new fields
      {
        $set: {firstName: req.body.firstName, lastName: req.body.lastName}
      },
    function(err, result, count) {
      // set local variables
      res.locals.user.firstName = req.body.firstName;
      res.locals.user.lastName = req.body.lastName;
      // redirect to homepage
      res.redirect('/create');
    });
  });
});




// listen on node env PORT or port 3000
app.listen(process.env.PORT || 3000);
