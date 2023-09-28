var express = require("express");
const nodemailer = require("nodemailer");
var router = express.Router();
const uuidv4 = require("uuid").v4;
const bcrypt = require("bcryptjs");
const User = require("../models/users");
const authMiddleware = require("../middlewares/authMiddleware");
const ErrorMessages = require("../errors/error_messages");
const HttpStatus = require("../errors/error_messages");
const mongoose = require("mongoose");
const UserContacts = require("../models/usercontacts");
const Profile = require("../models/profils");
const RoomProfiles = require("../models/roomProfiles");
const Rooms = require("../models/rooms");

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

/* delete user by uniqueId */
router.delete("/deleteUser/:uniqueId", async (req, res) => {
  const { uniqueId } = req.params;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const opts = { session };

    // Recherchez l'utilisateur par son uniqueId
    const existingUser = await User.findOne({ uniqueId });
    if (!existingUser) {
      return res.status(404).json({ result: false, error: "User not found" });
    }

    // Supprimez l'utilisateur
    await User.deleteOne({ uniqueId }, opts);

    // Supprimez les contacts de l'utilisateur
    await UserContacts.deleteOne({ userId: existingUser._id }, opts);

    // Supprimez le profil de l'utilisateur
    await Profile.deleteOne({ userId: existingUser._id }, opts);

    // Supprimez le profil de la salle de l'utilisateur
    await RoomProfiles.deleteMany({ userId: existingUser._id }, opts);

    // Supprimez les salles de l'utilisateur
    await Rooms.deleteMany({ userId: existingUser._id }, opts);

    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      message: "User and related documents deleted successfully",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ result: false, error: err.message });
  }
});

/* Change password */
router.post("/forgetPassword", async (req, res) => {
  const { email } = req.body;

  // Valider l'email
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ result: false, error: "Invalid email format." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ result: false, error: "User not found." });
    }

    // Générer un token de réinitialisation et enregistrer sa date d'expiration
    const resetToken = uuidv4();
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1); // Le token expire dans 1 heure

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = expirationDate;
    await user.save();

    const transporter = nodemailer.createTransport({
      host: "smtp.ionos.fr",
      port: 465, // Ou 465 selon votre configuration
      secure: true, // true pour 465, false pour les autres ports
      auth: {
        user: process.env.USER_PASS,
        pass: process.env.PASSWORD_USER_PASS,
      },
    });

    const resetLink = `https://liinker.io/reset-password?token=${resetToken}`; // Remplacez par votre lien réel
    const mailOptions = {
      from: process.env.USER_PASS,
      to: user.email,
      subject: "Password Reset Request",
      text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.
Click on this link to reset your password: ${resetLink}
This link is valid for 1 hour.
If you did not request this, please contact us.`,
    };

    transporter.sendMail(mailOptions, (err, response) => {
      if (err) {
        console.error("Error sending email:", err);
        return res
          .status(500)
          .json({ result: false, error: "Error sending email." });
      } else {
        return res
          .status(200)
          .json({ result: true, message: "Password reset email sent." });
      }
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ result: false, error: err.message });
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
