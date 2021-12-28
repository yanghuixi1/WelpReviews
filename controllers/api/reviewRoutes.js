const router = require("express").Router();
const auth = require("../../utils/auth");
const { User, Review } = require("../../models");

router.post("/", auth.withAuthAdd, async (req, res) => {
  try {
    const userData = await User.findByPk(req.session.user_id, {
      attributes: { exclude: ["password"] },
    }); // Fetches the current user that is logged in, as a database object
    let review = req.body.review || null;
    console.log(review);
    if (review === null) {
      // Reject the review creation if no review content is provided
      res.status(400).json({ message: "You must enter text for the review" });
      return;
    }
    // Create a new review and add to review table
    review = await Review.create({
      title: req.body.title,
      description: req.body.review,
    });
    // Relate new review to current user in user table
    userData.addReviews([review]);
    res.status(201).json(review);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
