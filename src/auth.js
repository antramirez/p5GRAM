// most code taken from auth.js from hw06,
// but it will be further edited before final deployment

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = mongoose.model('User');

function register(firstName, lastName, username, password, errorCallback, successCallback) {
  // validate first and last name
  if (firstName.length < 1) {
    const errObj = {message: 'FIRST NAME TOO SHORT'};
    console.log(errObj.message);
    errorCallback(errObj);
  }
  if (lastName.length < 1) {
    const errObj = {message: 'LAST NAME TOO SHORT'};
    console.log(errObj.message);
    errorCallback(errObj);
  }
  // check if username and password are both length of at least 8
  if (username.length < 8 || password.length < 8) {
    // create error object to log message and create parameter for error call back
    const errObj = {message: 'USERNAME PASSWORD TOO SHORT'};
    console.log(errObj.message);
    errorCallback(errObj);
  }
  else {
    // if username and password are valid, check if username exists in db
    User.findOne({username: username}, (err, result, count) => {
      // if username exists, create error object to log message
      // and create parameter for error callback
      if (result) {
        const errObj = {message: 'USERNAME ALREADY EXISTS'};
        console.log(errObj.message);
        errorCallback(errObj);
      }
      else {
        // if username is unique, create new user and hash password
        bcrypt.hash(password, 10, function(err, hash) {
          // if hasing error, create error object to log message
          // and create parameter for error callback
          if (err) {
            const errObj = {message: 'PASSWORD HASHING ERROR'};
            console.log(errObj.message);
            errorCallback(errObj);
          }
          else {
            // if no hashing error, save new user with hased password
            new User({
              firstName: firstName,
              lastName: lastName,
              username: username,
              password: hash
            }).save(function(err, result, count) {
              // if error saving user, create error object to log message
              // and create parameter for error callback
              if (err) {
                const errObj = {message: 'DOCUMENT SAVE ERROR'};
                console.log(errObj.message);
                errorCallback(errObj);
              }
              else {
                // if user is saved, call success call back with newly saved user
                successCallback(result);
              }
            });
          }
        });
      }
    });
  }
}

function login(username, password, errorCallback, successCallback) {
  // look for user
  User.findOne({username: username}, (err, user, count) => {
    if (!user) {
      // if user does not exist, create error object to log message
      // and create parameter for error callback
      const errObj = {message: 'USER NOT FOUND'};
      console.log(errObj.message);
      errorCallback(errObj);
    }
    else if (!err && user) {
      // if user exists, compare (hashed) password entered to hashed password in db
      bcrypt.compare(password, user.password, (err, passwordMatch) => {
       // regenerate session if passwordMatch is true
       // and pass in matching user if passwords match
       if (passwordMatch) {
         successCallback(user);
       }
       else {
         // if the passwords do not match, create error object to log message
         // and create parameter for error callback
         const errObj = {message: 'PASSWORDS DO NOT MATCH'};
         console.log(errObj.message);
         errorCallback(errObj);
       }
      });
   }
  });
}

function startAuthenticatedSession(req, user, cb) {
  // start session by setting session user to user logged in/registered and then call callback
  req.session.regenerate((err) => {
    req.session.user = user;
  });
  cb();
}

function updateUser(firstName, lastName, username, errorCallback, successCallback) {
  // validate potentially updated first name, last name, and username
  if (firstName.length < 1) {
    const errObj = {message: 'FIRST NAME TOO SHORT'};
    console.log(errObj.message);
    errorCallback(errObj);
  }
  if (lastName.length < 1) {
    const errObj = {message: 'LAST NAME TOO SHORT'};
    console.log(errObj.message);
    errorCallback(errObj);
  }
  if (username.length < 8) {
    const errObj = {message: 'USERNAME TOO SHORT'};
    console.log(errObj.message);
    errorCallback(errObj);
  }
  else {
    // success call back will update the user in the db
    successCallback();
  }
}

module.exports = {
  startAuthenticatedSession: startAuthenticatedSession,
  register: register,
  login: login,
  updateUser: updateUser
};
