var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/checkBody");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { ErrorMessages, HttpStatus } = require("../errors/error_messages");
const Role = require("../models/roles");
const User = require("../models/users");

router.post("/login", async (req, res) => {
  if (!checkBody(req.body, ["email", "password"])) {
    return res.json({ result: false, error: ErrorMessages.MISSING_FIELDS });
  }
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user && (await bcrypt.compare(req.body.password, user.password))) {
      // L'utilisateur est authentifié, maintenant nous récupérons le rôle.
      const role = await Role.findOne({ userId: user._id });
      // Générer un JWT pour l'utilisateur
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      return res.json({ result: true, user, token, role: role ? role.role : 'No role assigned' });
    } else {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ result: false, error: ErrorMessages.USER_NOT_FOUND });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ result: false, error: ErrorMessages.SERVER_ERROR });
  }
});


//update user informations
router.put("/updateUserData/:uniqueId", async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { uniqueId: req.params.uniqueId },
      { firstname: req.body.firstname, lastname: req.body.lastname, email: req.body.email },
      { new: true }
    );
    if (updatedUser) {
      return res.json({ result: true, user: updatedUser });
    } else {
      return res.status(HttpStatus.NOT_FOUND).json({ result: false, error: ErrorMessages.USER_NOT_FOUND });
    }
  } catch (err) {
    console.log(err);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ result: false, error: ErrorMessages.SERVER_ERROR });
  }
});



module.exports = router;
