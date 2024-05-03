const express = require("express");
const Book = require("../models/book");
const jsonschema = require('jsonschema'); 
const bookSchema = require("../schemas/bookSchema.json");
const ExpressError = require("../expressError");

const router = new express.Router();


/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:isbn", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.isbn);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */

router.post("/", async function (req, res, next) {
  try {
    //validate json schema of book data
    const validateResult = jsonschema.validate(req.body, bookSchema);
    if(!validateResult.valid) {
      let listOfErrors = validateResult.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400);
    }
    
    const book = await Book.create(req.body);
    return res.status(201).json({ book });
  } catch (err) {
    return next(err);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  try {
    //validate json schema of book data
    const validateResult = jsonschema.validate(req.body, bookSchema);
    if(!validateResult.valid) {
      let listOfErrors = validateResult.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400);
    }
    
    const book = await Book.update(req.params.isbn, req.body);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[isbn]   bookData (not all) => {book: updatedBook}  */

router.patch("/:isbn", async function (req, res, next) {
  try {
    // Get current book and update values from req.body
    const isbn = req.params.isbn;
    const book = await Book.findOne(isbn);

    // key-values from req.body
    const dynData = {...req.body};
    console.log(dynData);
    console.log("**********");
    for(let key in dynData){
      book[key] = dynData[key];
    }

    //validate json schema of book data
    const validateResult = jsonschema.validate(book, bookSchema);
    if(!validateResult.valid) {
      let listOfErrors = validateResult.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400);
    }
    
    const updatedBook = await Book.update(isbn, book);
    return res.json({ book: updatedBook });

  } catch (err) {
    return next(err);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  try {
    //validate json schema of book data
    const validateResult = jsonschema.validate(req.body, bookSchema);
    if(!validateResult.valid) {
      let listOfErrors = validateResult.errors.map(error => error.stack);
      throw new ExpressError(listOfErrors, 400);
    }
    
    const book = await Book.update(req.params.isbn, req.body);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
