const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Register new user 
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!isValid(username)) {
    return res.status(404).json({ message: "Invalid username" })
  }
  if (users.some((users) => users.username === username)) {
    return res.status(404).json({ message: "User already exist" })
  }

  users.push({ "username": username, "password": password });
  return res.status(200).json({ message: "Successfully Registered, Now you can login" })
});



// Get the book list available in the shop
public_users.get('/', function (req, res) {
  let myPromise = new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ books: books });
    }, 1000); //one second delay
  })

  myPromise.then((success) => {
    res.status(200).json(success);
  })
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("one second delay completed");
    }, 1000);
  })
  const booksByIsbn = books[isbn - 1];

  if (booksByIsbn) {
    res.status(200).json({ book: booksByIsbn });
  } else {
    throw new Error("Book not found");
  }

});



// -------------------------------------------------------------------------------------------

function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    const booksByAuthor = books.filter((book) => book.author === author);
    setTimeout(() => {
      if (booksByAuthor.length > 0) {
        resolve({ books: booksByAuthor });
      } else {
        reject("Author not found");
      }
    }, 1000);
  });
}

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  getBooksByAuthor(author)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((error) => {
      res.status(404).send(error);
    });
});

// -------------------------------------------------------------------------------------------

function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    const booksByTitle = books.filter((book) => book.title === title);
    setTimeout(() => {
      if (booksByTitle.length > 0) {
        resolve({ books: booksByTitle });
      } else {
        reject("Book not found");
      }
    }, 1000);
  });
}

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  getBooksByTitle(title)
    .then((success) => {
      res.status(200).json(success);
    })
    .catch((error) => {
      res.status(404).send(error);
    });
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const review = books[isbn - 1].reviews;
  res.status(200).json({ review: review })
});

module.exports.general = public_users;
