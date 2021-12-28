const router = require("express").Router();
const helpers = require("../utils/helpers");

router.get("/", async (req, res) => {
  // Handles dispatching search requests against Google Books API
  try {
    let query = req.query.q;
    let category = req.query.category;
    let results = null;
    if (category === "author") {
      // Search by author
      results = await helpers.getBooksByAuthor(query);
    } else if (category === "title") {
      // Search by title
      results = await helpers.getBooksByTitle(query);
    } else if (category === "subject") {
      // Search by subject
      results = await helpers.getBooksBySubject(query);
    } else if (category === undefined) {
      // General text search
      results = await helpers.getBooks(query);
    }
    if (results != null) {
      res.render("searchResults", { results });
    } else {
      res.status(404).json("Cannot find page at this resource");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json("request failed");
  }
});

module.exports = router;
