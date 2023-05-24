var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const uuidv4 = require("uuid").v4;
const { ErrorMessages, HttpStatus } = require("../errors/error_messages");

const User = require("../models/users");

/* creation d'un user with JWT rte signup */

router.post("/register", async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!checkBody(req.body, ["username", "password", "email"])) {
    return res.json({ result: false, error: ErrorMessages.MISSING_FIELDS });
  }
  try {
    //user existing ?
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ result: false, error: ErrorMessages.USER_EXISTS });
    }
    //hashage du password
    const hashedPassword = await bcrypt.hash(password, 10);
    //creation du user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      uniqueId: uuidv4(),
      role,
    });
    const savedUser = await newUser.save();
    let token;
    try {
      //creation d'un jeton token avec jwt
      token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      console.log("Generated token:", token);
    } catch (err) {
      // Si une erreur se produit lors de la génération du JWT, renvoyer une réponse d'erreur
      console.error(err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        result: false,
        error: ErrorMessages.JWT_ERROR,
      });
    }
    return res.json({ result: true, user: savedUser, token });
  } catch (err) {
    // Si une erreur se produit pendant la création de l'utilisateur, renvoyer une réponse d'erreur
    console.error(err);
    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ result: false, error: ErrorMessages.SERVER_ERROR });
  }
});

module.exports = router;
