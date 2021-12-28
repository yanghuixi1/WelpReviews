const router = require("express").Router();
const { User } = require("../../models");
const { ValidationError } = require("sequelize");

router.post("/login", async (req, res) => {
  try {
    // Query user data from the database
    const userData = await User.findOne({ where: { email: req.body.email } });

    // Reject login if user cannot be found in database
    if (!userData) {
      res
        .status(400)
        .json({ message: "Incorrect email or password, please try again" });
      return;
    }

    // Validate provided password against stored one
    const validPassword = await userData.checkPassword(req.body.password);

    // Reject login if password is invalid
    if (!validPassword) {
      res
        .status(400)
        .json({ message: "Incorrect email or password, please try again" });
      return;
    }

    // Add the user ID and login status to session context for access in subsequent requests
    req.session.save(() => {
      req.session.user_id = userData.id; // Set the user_id attribute to the session object
      req.session.logged_in = true; // Set the logged_in attribute to the session object
      res
        .status(200)
        .json({ user: userData, message: "You are now logged in!" });
    });
  } catch (err) {
    res.status(400).json(err);
  }
});

router.post("/logout", (req, res) => {
  // Logout is performed by ending the current session
  if (req.session.logged_in) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

router.post("/register", async (req, res) => {
  // Creates a new user and adds their data to the database
  try {
    const newUser = req.body;
    console.log(newUser);
    try {
      // Check if the user currently exists
      const currentUser = await User.checkIfExists(newUser.email);
      if (currentUser != null) {
        // If they already exist, reject the registration
        res.status(400).json({ message: "alreadyExists" });
        return;
      }
      // Otherwise create a new user account
      const userData = await User.create(newUser);
      // Add the user ID and login status to session context for access in subsequent requests
      req.session.save(() => {
        req.session.user_id = userData.id;
        req.session.logged_in = true;
        res.status(200).json({ message: "You are now logged in!" });
      });
    } catch (err) {
      if (err instanceof ValidationError) {
        // If email is an invalid format, reject the registration
        res.status(400).json({ message: err.errors[0].path });
      }
    }
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
