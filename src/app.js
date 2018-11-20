// 1st draft of app

// require express and path modules, and make an express app
const express = require('express');
// require mongoose module to connect to database
const mongoose = require('mongoose');
require('./db');

// require session module
const session = require('express-session');


const path = require('path');
const auth = require('./auth.js');


const app = express();

const User = mongoose.model('User');


// set session options middleware
app.use(session({secret: 'secret message', saveUninitialized: false, resave: false}));

app.set('view engine', 'hbs');

// full path relative to public
const fullPath = path.join(__dirname, 'public');

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
  res.render('home');
});

app.get('/register', (req, res) => {
  res.render('register');
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
      res.redirect('/');
    });
  });
});

app.get('/login', (req, res) => {
  res.render('login');
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
      res.redirect('/');
    });
  });
})

app.get('/:username/sketches', (req, res) => {
  const path = req.params.username + '/sketches'
  res.render(path);
});

app.get('/add', (req, res) => {
  res.render('add');
});

app.get('/create', (req, res) => {
  res.render('create');
});

app.get('/settings', (req, res) => {
  res.render('settings');
});

app.post('/settings', (req, res) => {
  // call update function
  auth.updateUser(req.body.firstName, req.body.lastName, req.body.username,
  (errObj) => {
    // if there is an error, display message above the form
    res.render('settings', {message: errObj.message})
  },
  () => {
    User.updateOne({_id: res.locals.user._id},
      // set new fields
      {
        $set: {firstName: req.body.firstName, lastName: req.body.lastName, username: req.body.username}
      },
    function(err, result, count) {
      // set local variables
      res.locals.user.firstName = req.body.firstName;
      res.locals.user.lastName = req.body.lastName;
      res.locals.user.username = req.body.username;
      // redirect to homepage
      res.redirect('/');
    });
  });
});

// listen on node env PORT or port 3000
app.listen(process.env.PORT || 3000);
