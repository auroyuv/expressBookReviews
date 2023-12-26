const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if the username is not empty and not undefined
const isValid = (username) => { //returns boolean
  if (username && username.trim() !== '') {
    return true;
  }
  return false;
}

// Check if username and password match the one we have in records.
const authenticatedUser = (username, password) => { //returns boolean
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password)
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Invalid request: username and password are required" })
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 })

    req.session.authorization = {
      accessToken,
      username
    }

    return res.status(200).send("User logged in successfully")
  } else {
    return res.status(404).send("Check your username and password")
  }
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;
  const reviewText = req.body.review;

  if (!username) {
    return res.status(400).json({ message: "Invalid request: username is required" });
  } else if (!isbn) {
    return res.status(400).json({ message: "Invalid request: ISBN is required" });
  } else if (!reviewText) {
    return res.status(400).json({ message: "Invalid request: review is required" });
  }
  const reviewingBook = books[isbn - 1];

  if (reviewingBook) {
    reviewingBook.reviews[username] = reviewText;

    return res.status(200).json({ message: "Review added or modified successfully", reviews: reviewingBook.reviews });
  } else {
    return res.status(404).json({ message: "Book not found with the given ISBN" });
  }
});

//Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const username = req.session.authorization.username;
  const isbn = req.params.isbn;

  if (!username) {
    return res.status(400).json({ message: "Invalid request: username is required" });
  } else if (!isbn) {
    return res.status(400).json({ message: "Invalid request: ISBN is required" });
  }
  const reviewingBook = books[isbn - 1];

  if (reviewingBook) {
    if (reviewingBook.reviews.hasOwnProperty(username)) {
      delete reviewingBook.reviews[username];
      return res.status(200).json({ message: "Review deleted successfully", reviews: reviewingBook.reviews });
    } else {
      return res.status(404).json({ message: "Review not found for the given ISBN and username" });
    }
  } else {
    return res.status(404).json({ message: "Book not found with the given ISBN" });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
