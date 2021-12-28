const router = require("express").Router();
const axios = require("axios");
const helpers = require("../../utils/helpers");
const auth = require("../../utils/auth");
const { User, Book } = require("../../models");

router.post("/", auth.withAuthAdd, async (req, res) => {
  // Creates a new book and relates it to the current user
  try {
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ["password"] },
    }); // Fetches the current user that is logged in, as a database object

    // Rating, total ratings, and thumbnail can all be null, but are sent through HTTP as empty strings
    // As such, we need to convert empty strings to null before inserting into database
    let rating = req.body.rating || null;
    let totalRatings = req.body.totalRatings || null;
    let thumbnail = req.body.thumbnail || null;
    // Check if book currently exists in the book table
    let book = await Book.findOne({ where: { google_id: req.body.googleId } });
    if (book === null) {
      // If it doesn't exist, then add it to the book table
      book = await Book.create({
        google_id: req.body.googleId,
        title: req.body.title,
        author: req.body.author,
        rating: rating,
        total_ratings: totalRatings,
        thumbnail: thumbnail,
      });
    }
    // Relate the book to the current user, also setting the reading status
    userData.addBooks([book], {
      through: { reading_status: req.body.readingStatus },
    });
    res.status(201).json(book);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get("/author", async (req, res) => {
  try {
    let name = req.query.name;
    let results = await helpers.getBooksByAuthor(name);
    res.status(200).json(results);
  } catch (error) {
    console.log(error);
    res.status(500).json("request failed");
  }
});

router.get("/:id", async (req, res) => {
  try {
    let url = `https://www.googleapis.com/books/v1/volumes/${req.params.id}`;
    const resp = await axios.get(url);
    res.status(200).json(resp.data);
  } catch (error) {
    console.log(error);
    res.status(500).json("request failed");
  }
});

module.exports = router;
