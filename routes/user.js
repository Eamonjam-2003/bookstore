var express = require('express');
const { check, validationResult } = require('express-validator');
var router = express.Router();
const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const User = require("../schemas/User");
const passport = require("passport");
//Registration
router.route('/register').get((req, res, next) => {
  res.render('Register', { title: 'Bookstore | Register User' });
}).post(async (req, res, next) => {
  await check("name", "Name is required").notEmpty().run(req);
  await check("email", "Email is required").notEmpty().run(req);
  await check("email", "Email is invalid").isEmail().run(req);
  await check("password", "Password is required").notEmpty().run(req);
  await check("passwordConfirm", "Password Confirm is required").notEmpty().run(req);
  await check("password", "Passwords do not match").equals(req.body.passwordConfirm).run(req);
  var errors = validationResult(req);
  if (errors.isEmpty()) {
    let newUser = new User();
    newUser.name = req.body.name;
    newUser.email = req.body.email;
    bcryptjs.genSalt(10, (error, salt) => {
      bcryptjs.hash(req.body.password, salt, (error, passwordHash) => {
        if (error) {
          console.log(JSON.stringify(error));
        }
        else {
          newUser.password = passwordHash;
          newUser.save((error) => {
            if (error) {
              console.log(JSON.stringify(error));
            }
            else {
              res.redirect("/user/login");
            }
          })
        }
      })
    });
  }
  else {
    res.render('Register', { title: 'Bookstore | Register User', errors: errors.array() });
  }
});
//Login
router.route('/login').get(function (req, res, next) {
  res.render('Login', { title: 'Bookstore | Login User' });
}).post(async (req, res, next) => {
  await check("email", "Email is required").notEmpty().run(req);
  await check("email", "Email is invalid").isEmail().run(req);
  await check("password", "Password is required").notEmpty().run(req);
  var errors = validationResult(req);
  if (errors.isEmpty()) {
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/user/login",
      failureMessage: true
    })(req, res, next);
  }
  else {
    res.render('Login', { title: 'Bookstore | Login User', errors: errors.array() });
  }
});
//Logout
router.route('/logout').get(function (req, res, next) {
  req.logOut((error)=>{
    if (error){
      return next(error);
    }
    res.redirect("/user/login");
  })
})

module.exports = router;
