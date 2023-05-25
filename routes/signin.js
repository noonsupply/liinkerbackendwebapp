var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { ErrorMessages, HttpStatus } = require("../errors/error_messages");

const User = require("../models/users");

router.post("/login", async (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    return res.json({ result: false, error: ErrorMessages.MISSING_FIELDS });
  }
  try {
    const data = await User.findOne({ email: req.body.email });
    if (data && (await bcrypt.compare(req.body.password, data.password))) {
      // Generate a JWT token for the user
      const token = jwt.sign({ userId: data._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      return res.json({ result: true, user: data, token });
    } else {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ result: false, error: ErrorMessages.USER_NOT_FOUND });
    }
  } catch (err) {
    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ result: false, error: err });
  }
});

module.exports = router;
