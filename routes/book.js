var express = require('express');
var router = express.Router();
const mongoose = require("mongoose");
const genres = ["Comedy", "Tragedy", "Fiction", "Politics"];
const Book = require('../schemas/Book');
const User = require('../schemas/User');
const fetch = require('node-fetch');
const { check, validationResult } = require('express-validator');

function ensureIsLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect("/user/login");
    }
    else {
        next();
    }
}
//Book Delete
router.route("/delete/:id")
    .get(ensureIsLoggedIn, (req, res) => {
        var id = req.params.id;
        Book.deleteOne({ _id: id }, (error) => {
            if (error) {
                res.send("Error");
            }
            else {
                res.redirect("/");
            }
        });

    });
//Book edit
router.route("/edit/:id")
    .get(ensureIsLoggedIn, (req, res) => {
        var id = req.params.id;
        Book.findById(id, (error, book) => {
            if (book.posted_by != req.user.id) {
                res.redirect("/user/login");
            }
            if (error) {
                res.end("You cannot edit this book");
            }
            else {
                res.render('Edit', { title: 'Edit a book', genres: genres, book: book });
            }
        });
    })
    .post(ensureIsLoggedIn, (req, res) => {
        var id = req.params.id;
        var book = {};
        book.title = req.body.title;
        book.rating = req.body.rating;
        book.pages = req.body.pages;
        book.author = req.body.author;
        book.genres = req.body.genres;
        book.isbn = req.body.isbn;
        if (Book.findById(id, (error, foundBook))) {
            if (foundBook.posted_by != req.user.id) {
                res.redirect("/user/login");
            }
            Book.updateOne({ _id: id }, book, (error) => {
                res.redirect("/");
            });
        }
    });
//Book Add
router.route("/add")
    .get(ensureIsLoggedIn, (req, res) => {
        res.render('Add', { title: 'Add a book', genres: genres });
    })
    .post(ensureIsLoggedIn, async (req, res) => {
        var book = new Book();
        await check('title', "Title is required").notEmpty().run(req);
        await check('author', "Author is required").notEmpty().run(req);
        await check('rating', "Rating is required").notEmpty().run(req);
        await check('genres', "Genres is required").notEmpty().run(req);
        await check('pages', "Pages is required").notEmpty().run(req);
        await check('isbn', "ISBN is required").notEmpty().run(req);
        await check('rating', "Rating cannot be greater than 10 or lower than 0").isInt({ min: 0, max: 10 }).run(req);
        await check('genres', "Please select a valid genre").isIn(genres).run(req);
        const errors = validationResult(req);
        book.title = req.body.title;
        book.rating = req.body.rating;
        book.pages = req.body.pages;
        book.author = req.body.author;
        book.genres = req.body.genres;
        book.posted_by = req.user.id;
        book.isbn = req.body.isbn;
        if (errors.isEmpty()) {
            book.save((error) => {
                if (error) {
                    console.log(error);
                    res.end("Error happened")
                }
                else {
                    res.redirect("/");
                }
            });
        }
        else {
            res.render("Add", { "genres": genres, "errors": errors.array() })
        }

    });

router.route("/:id").get((req, res) => {
    var id = req.params.id;
    Book.findById(id, (error, foundBook) => {
        User.findById(foundBook.posted_by, (error, foundUser) => {
            if (error) {
                console.log(error);
                res.end("Error happened");
            }
            else {
                //call api and get details
                fetch('https://www.googleapis.com/books/v1/volumes?q=' + foundBook.isbn + "&maxResults=1")
                    .then(res => res.json())
                    .then(json => {
                        console.log(json)
                        if (json.totalItems) {
                            var book = json.items[0];
                            var description = book['volumeInfo']['description'];
                            var publisher = book['volumeInfo']['publisher'];
                            var publishedDate = book['volumeInfo']['publishedDate'];

                            res.render("book", { book: foundBook, userName: foundUser.name, 
                                desc: description, pub: publisher, pubDate: publishedDate })

                        }
                    })
                }
        });

    })
});
module.exports = router;
