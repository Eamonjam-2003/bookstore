var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const Book = require("../schemas/Book");


/* GET home page. */
router.get('/', function (req, res, next) {
  Book.find({}, (error,booksArray) => {
    if (error) {
      console.log("Something bad happened");
    }
    else {
      res.render('index', { title: 'Bookstore | List of books', books: booksArray });
    }
  })

});

module.exports = router;
