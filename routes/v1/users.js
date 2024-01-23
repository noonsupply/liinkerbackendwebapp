var express = require("express");
const nodemailer = require("nodemailer");
var router = express.Router();
const uuidv4 = require("uuid").v4;
const bcrypt = require("bcryptjs");
const User = require("../../models/v1/users");
const authMiddleware = require("../../middlewares/authMiddleware");
const ErrorMessages = require("../../errors/error_messages");
const HttpStatus = require("../../errors/error_messages");
const mongoose = require("mongoose");
const UserContacts = require("../../models/v1/usercontacts");
const Profile = require("../../models/v1/profils");
const RoomProfiles = require("../../models/v1/roomProfiles");
const Rooms = require("../../models/v1/rooms");
const Profil = require('../../models/v1/profils')
const Role = require('../../models/v1/roles')
const ejs = require('ejs');
const path = require('path');


/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});
router.get("/allUser", async (req, res) => {
  try {
    const users = await User.find({});

    if (!users || users.length === 0) {
      return res.status(404).json({ result: false, error: "Not user in database" });
    }

    // Préparation d'un tableau pour stocker les promesses
    const usersWithDetailsPromises = users.map(async (user) => {
      // Compter les profils
      const profileCount = await Profil.countDocuments({ userId: user._id });

      // Récupérer le rôle
      const roleDocument = await Role.findOne({ userId: user._id }); // Assurez-vous que Role est le modèle correct pour votre collection de rôles
      const role = roleDocument ? roleDocument.role : "No role assigned"; // Si aucun rôle n'est trouvé, vous pouvez définir une valeur par défaut

      // Retourne un nouvel objet avec les informations de l'utilisateur, le compte de profil et le rôle
      return {
        ...user._doc, // ...user._doc contient toutes les propriétés du document de l'utilisateur
        profileCount,
        role, // Ajout du rôle à la réponse
      };
    });

    // Attendre que toutes les promesses se résolvent
    const usersWithDetails = await Promise.all(usersWithDetailsPromises);

    return res.json({ result: true, users: usersWithDetails });
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
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ result: false, error: "User not found" });
    }

    // Supprimez l'utilisateur
    await User.deleteOne({ uniqueId }, opts);

    // Supprimez les contacts de l'utilisateur
    await UserContacts.deleteOne({ userId: existingUser._id }, opts);

    // Ici, vous supprimez les profils associés à l'utilisateur. 
    // Assurez-vous que le nom de la collection est correct, dans votre code précédent, 
    // c'était "Profil", donc je vais utiliser ce nom.
    await Profil.deleteMany({ userId: existingUser._id }, opts);

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

    const generateCode = () => {
      return Math.floor(100000 + Math.random() * 900000).toString(); // Génère un code entre 100000 et 999999
    };
    
    // Générer un code de réinitialisation et enregistrer sa date d'expiration
    const resetCode = generateCode();
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1); // Le code expire dans 1 heure

    user.passwordResetCode = resetCode; 
    user.passwordResetCodeExpires = expirationDate; 
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

    const mailOptions = {
      from: process.env.USER_PASS,
      to: user.email,
      subject: "Your Password Reset Code",
      text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.
    Use this code to reset your password: ${resetCode}
    This code is valid for 1 hour.
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

// welcome email
router.post("/welcomeEmail", async (req, res) => {
  const { email } = req.body;

  try {

    const transporter = nodemailer.createTransport({
      host: "smtp.ionos.fr",
      port: 465, // Ou 465 selon votre configuration
      secure: true, // true pour 465, false pour les autres ports
      auth: {
        user: process.env.USER_PASS,
        pass: process.env.PASSWORD_USER_PASS,
      },
    });

    const emailHtml = await ejs.renderFile(path.join(__dirname, '../../views/emails/welcome-email.ejs'));

    const mailOptions = {
      from: process.env.USER_PASS,
      to: email,
      subject: "Bienvenue sur Liinker",
      text: `Bienvenue sur Liinker`,
      html: emailHtml,
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
          .json({ result: true, message: "Welcome email sent." });
      }
    });

  }
  catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ result: false, error: err.message });
  }
});

// update password user with this rte
router.post("/changePassword", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ result: false, error: "User not found!" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();
    res.status(200).json({ result: true, message: "Password changed successfully." });
    
  } catch (err) {
    res.status(500).json({ result: false, error: err.message });
  }
});



router.post("/verifyCode", async (req, res) => {
  const { verificationCode, email } = req.body;

  // Validation des données reçues
  if (!verificationCode || !email) {
    return res.status(400).json({ result: false, error: "Required fields are missing." });
  }

  try {
    // Trouver l'utilisateur avec l'email spécifié
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ result: false, error: "User not found." });
    }

    // Vérifier si le code et le passwordResetCode correspondent
    if (user.passwordResetCode !== verificationCode) {
      return res.status(400).json({ result: false, error: "Invalid verification code." });
    }

    // Vérifier si le code a expiré
    if (new Date() > user.passwordResetCodeExpires) {
      // Réinitialiser le code et sa date d'expiration pour des raisons de sécurité
      user.passwordResetCode = null;
      user.passwordResetCodeExpires = null;
      await user.save();

      return res.status(400).json({ result: false, error: "Verification code has expired." });
    }

    // Si tout est correct, renvoyez un succès
    return res.status(200).json({ result: true, message: "Verification successful." });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ result: false, error: err.message });
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

router.put("/profilUpdate", authMiddleware, async (req, res) => {
  const userId = req.body.userId;
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const email = req.body.email;
  const language = req.body.language;

  try {
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ result: false, message: "User not found" });
    }

    existingUser.firstname = firstname;
    existingUser.lastname = lastname;
    existingUser.email = email;
    existingUser.language = language;

    const updatedUser = await existingUser.save();

    return res.status(200).json({ result: true, user: updatedUser });
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res
      .status(500)
      .json({ result: false, message: "Internal server error" });
  }
});


module.exports = router;
