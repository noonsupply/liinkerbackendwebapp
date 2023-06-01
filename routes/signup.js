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
  const { email, password, confirmPassword } = req.body;
  if (!checkBody(req.body, ["password", "email", "confirmPassword"])) {
    return res.json({ result: false, error: ErrorMessages.MISSING_FIELDS });
  }
  try {
    //user existing ?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ result: false, error: ErrorMessages.USER_EXISTS });
    } else if (password !== confirmPassword) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        result: false,
        error: "password and confirmPassword are different",
      });
    }
    //hashage du password
    const hashedPassword = await bcrypt.hash(password, 10);
    //creation du user
    const newUser = new User({
      email,
      password: hashedPassword,
      uniqueId: uuidv4(),
    });
    const savedUser = await newUser.save();
    let token;
    try {
      //creation d'un jeton token avec jwt
      token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      // console.log("Generated token:", token);
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

//Ajouter nom et prénom à l'utilisateur
router.post("/addUsername", async (req, res) => {
  const { firstname, lastname, uniqueId } = req.body;

  if (!checkBody(req.body, ["firstname", "lastname"])) {
    return res.json({ result: false, error: ErrorMessages.MISSING_FIELDS });
  }

  try {
    // Trouver l'utilisateur correspondant à l'uniqueId dans la base de données
    const user = await User.findOne({ uniqueId });

    if (!user) {
      // Si aucun utilisateur correspondant n'est trouvé, renvoyer une réponse d'erreur
      return res.status(HttpStatus.NOT_FOUND).json({ result: false, error: ErrorMessages.USER_NOT_FOUND });
    }

    user.firstname = firstname;
    user.lastname = lastname;

    // Sauvegarder les modifications de l'utilisateur dans la base de données
    await user.save();

    // Renvoyer une réponse de succès
    return res.json({ result: true, message: "Username added successfully" });
  } catch (err) {
    // Si une erreur se produit pendant la mise à jour de l'utilisateur, renvoyer une réponse d'erreur
    console.error(err);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ result: false, error: ErrorMessages.SERVER_ERROR });
  }
});


module.exports = router;
