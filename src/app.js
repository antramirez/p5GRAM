// 1st draft of app

// require express and path modules, and make an express app
const express = require('express');
const path = require('path');
const app = express();

// require mongoose module to connect to database
const mongoose = require('mongoose');
require('./db');

// require session module
const session = require('express-session');
// set session options middleware
app.use(session({secret: 'secret message', saveUninitialized: false, resave: false}));

app.set('view engine', 'hbs');

// full path relative to public
const fullPath = path.join(__dirname, 'public');

// set middleware to serve static content relative to public directory
app.use(express.static(fullPath));

// body parsing middleware
app.use(express.urlencoded({extended: false}));

// paths
app.get('/', (req, res) => {
  res.render('index');
});
app.get('/', (req, res) => {
  res.render('login');
});
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

// listen on port 3000
app.listen(3000);
