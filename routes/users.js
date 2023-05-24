var express = require("express");
const nodemailer = require("nodemailer");
var router = express.Router();
const uuidv4 = require("uuid").v4;
const bcrypt = require("bcryptjs");
const User = require("../models/users");
const authMiddleware = require("../middlewares/authMiddleware");
const ErrorMessages = require("../errors/error_messages");
const HttpStatus = require("../errors/error_messages");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

/* get All user */
router.get("/allUser", async (req, res) => {
  try {
    const users = await User.find({});
    if (!users || users.length === 0) {
      return res
        .status(404)
        .json({ result: false, error: "Not user in database" });
    }
    return res.json({ result: true, users });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      result: false,
      error: "Error internal server",
      details: err.message,
    });
  }
});

/* Change password */
router.post("/forgetPassword", async (req, res) => {
  // on veut trouver l'utilisateur dans la base de donnée avec une entree email
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    // si le user n'existe pas on return false ci-dessous
    if (!user) {
      res
        .status(404)
        .json({ result: false, error: ErrorMessages.USER_NOT_FOUND });
    }
    //test
    //sinon on genere un password temporaire
    const tempPassword = uuidv4().substring(0, 22);
    //on hash le password temporaire pour la sécurite
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    // on remplace le password du user avec le password temporaire
    user.password = hashedPassword;
    // on enregistre en db
    await user.save();

    // on envoie avec nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        // adresse email de l'admin
        user: process.env.USER_PASS,
        pass: process.env.PASWWORD_USER_PASS,
      },
    });
    const mailOptions = {
      from: process.env.USER_PASS,
      to: user.email,
      subject: "Password Reset Request",
      text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.
Here is your temporary password: ${tempPassword}
Please use this temporary password to log in and change your password immediately.
If you did not request this, please contact us and change your password as soon as possible.`,
    };

    transporter.sendMail(mailOptions, (err, response) => {
      if (err) {
        console.error("Error sending email:", err);
        res.status(500).json({ result: false, error: "Error sending email." });
      } else {
        res
          .status(200)
          .json({ result: true, message: "Password reset email sent." });
      }
    });
  } catch (err) {
    res.status(500).json({ result: false, error: err.message });
  }
});

// update password user with this rte
router.post("/changePassword", async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;
  // creation d'une rte avec entré user (email, currentPassword and newPassrd)
  try {
    const user = await User.findOne({ email });
    // on cherche le user dans la db par le mail
    if (!user) {
      res.status(404).json({ result: false, error: "User not found!" });
    }

    //on verifie si le currentPassword et le user.password sont identique
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    //si il ne sont pas identique on return false
    if (!isPasswordValid) {
      res
        .status(400)
        .json({ result: false, error: "Invalid current password!" });
    } else {
      //sinon on crée un nouveau password qu'on enregistre en db et return true
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedNewPassword;
      await user.save();
      res
        .status(200)
        .json({ result: true, message: "Password changed successfully." });
    }
  } catch (err) {
    res.status(500).json({ result: false, error: err.message });
  }
});

//route permettant de recuperer les infos d'un user avec le middleware
router.get("/userAuth", authMiddleware, async (req, res) => {
  const userId = req.userId;

  try {
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ result: false, message: "User not found" });
    }
    return res.status(200).json({ result: true, user: existingUser });
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res
      .status(500)
      .json({ result: false, message: "Internal server error" });
  }
});

module.exports = router;
