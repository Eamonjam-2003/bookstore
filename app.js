var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require("mongoose");
const session = require("express-session");
const dataBaseConfig = require("./config/database");
const passport = require("passport");
require("./config/passport")(passport);
//Router Import
var indexRouter = require('./routes/index');
var bookRouter = require('./routes/book');
var userRouter = require('./routes/user');
var app = express();
//Database Connection
mongoose.connect(dataBaseConfig.connectionString)
let dbconnection = mongoose.connection;
dbconnection.once("open", () => { console.log("Connected to mongodb") });
dbconnection.on("error", () => { console.log("Failed to execute db command") });
//Session setup
app.use(session({
  secret: "sdaopfiuasdoifu",
  resave: false,
  saveUninitialized: false,
  cookie: {}
}));
//Passport setup
app.use(passport.initialize());
app.use(passport.session());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// Router setup
app.get("*", (req, res, next) => {
  console.log(req.user);
  res.locals.user = req.user || null;
  next();
});

app.use('/', indexRouter);
app.use('/book', bookRouter);
app.use('/user', userRouter);
//req.user attacher

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
