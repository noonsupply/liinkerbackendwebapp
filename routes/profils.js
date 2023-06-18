var express = require("express");
var router = express.Router();
const { ErrorMessages, HttpStatus } = require("../errors/error_messages");

const Profil = require("../models/profils");
const User = require("../models/users");

// add une carte de visite a l'utilisateur
router.post("/addProfil", async (req, res) => {
  const {
    uniqueId,
    image,
    title,
    firstname,
    lastname,
    jobTitle,
    email,
    website,
    phone,
    adress,
    city,
    linkedin,
    snapchat,
    instagram,
    backgroundColor,
    tags,
  } = req.body;

  // on pourra recuperer l'erreur si ils y as des champs manquants comme ci-dessous (a completer)
  if (!uniqueId || !lastname || !firstname) {
    return res
      .status(400)
      .json({ result: false, error: ErrorMessages.MISSING_FIELDS });
  }
  try {
    const user = await User.findOne({ uniqueId });
    if (!user) {
      return res
        .status(400)
        .json({ result: false, error: ErrorMessages.USER_NOT_FOUND });
    }
    const newProfil = new Profil({
      userId: user._id,
      image,
      title,
      firstname,
      lastname,
      jobTitle,
      email,
      website,
      phone,
      adress,
      city,
      linkedin,
      snapchat,
      instagram,
      backgroundColor,
      tags,
    });
    const saveNewProfil = await newProfil.save();
    return res.json({ result: true, saveNewProfil });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ result: false, error: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//vnm afficher les cards par utilisateur
router.get("/displayCard/:uniqueId", async (req, res) => {
  const { uniqueId } = req.params;
  try {
    const user = await User.findOne({ uniqueId });
    if (!user) {
      return res
        .status(400)
        .json({ result: false, error: ErrorMessages.USER_NOT_FOUND });
    }
    const cards = await Profil.find({ userId: user._id });
    if (!cards || cards.length === 0) {
      return res
        .status(400)
        .json({ result: false, error: ErrorMessages.NOT_CARD_FOR_USER });
    }
    return res.json({ result: true, cards });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ result: false, error: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

//Modifier les cards
router.put("/updateCard/:uniqueId", async (req, res) => {
  const { uniqueId } = req.params;
  const {
    image,
    title,
    firstname,
    lastname,
    jobTitle,
    email,
    website,
    phone,
    adress,
    city,
    linkedin,
    snapchat,
    instagram,
    backgroundColor,
    tags,
  } = req.body;
  try {
    const user = await User.findOne({ uniqueId });
    if (!user) {
      return res
        .status(400)
        .json({ result: false, error: ErrorMessages.USER_NOT_FOUND });
    }
    const card = await Profil.findOne({ userId: user._id });
    if (!card) {
      return res
        .status(400)
        .json({ result: false, error: ErrorMessages.NOT_CARD_FOR_USER });
    }
    const cardUpdate = await Profil.findOneAndUpdate(
      { userId: user._id },
      {
        image,
        title,
        firstname,
        lastname,
        jobTitle,
        email,
        website,
        phone,
        adress,
        city,
        linkedin,
        snapchat,
        instagram,
        backgroundColor,
        tags,
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!cardUpdate) {
      return res
        .status(400)
        .json({ result: false, error: ErrorMessages.NOT_CARD_FOR_USER });
    }
    return res.status(200).json({
      result: true,
      data: cardUpdate,
    });
  } catch (error) {
    return res.status(400).json({
      result: false,
      error: ErrorMessages.NOT_CARD_FOR_USER,
    });
  }
});

// Supprimer une carte de visite
// router.delete("/deleteCard/:uniqueId", async (req, res) => {
//   const { uniqueId } = req.params;
//   try {
//     const user = await User.findOne({ uniqueId });
//     if (!user) {
//       return res
//         .status(400)
//         .json({ result: false, error: ErrorMessages.USER_NOT_FOUND });
//     }

//     const card = await Profil.findOne({ userId: user._id });
//     if (!card) {
//       return res
//         .status(400)
//         .json({ result: false, error: ErrorMessages.NOT_CARD_FOR_USER });
//     }

//     await Profil.findOneAndDelete({ userId: user._id });

//     return res.status(200).json({
//       result: true,
//       message: "Card deleted successfully",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       result: false,
//       error: HttpStatus.INTERNAL_SERVER_ERROR,
//     });
//   }
// });

router.delete("/deleteCard/:uniqueId/:profilId", async (req, res) => {
  const { uniqueId, profilId } = req.params;
  try {
    const user = await User.findOne({ uniqueId });
    if (!user) {
      return res
        .status(400)
        .json({ result: false, error: ErrorMessages.USER_NOT_FOUND });
    }

    const card = await Profil.findOne({ _id: profilId });
    if (!card) {
      return res
        .status(400)
        .json({ result: false, error: ErrorMessages.NOT_CARD_FOR_USER });
    }

    await Profil.deleteOne({ _id: profilId });

    return res.status(200).json({
      result: true,
      message: "Card deleted successfully",
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({
      result: false,
      error: error,
    });
  }
});

<<<<<<< HEAD
// Get all detail from one cardId
router.get("/getCardDetail/:profilId", async (req, res) => {
  try {
    // get the profile by id and populate with other details like owner name etc..
    const profile = await Profil.findOne({ _id: req.params.profilId }).populate("userId");
    
    if (!profile) {
      return res.status(400).json({ error: ErrorMessages.NOT_CARD_FOR_USER });
    }
    
    return res.status(200).json(profile);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: error });
  }
});



=======
//display all cards
router.get("/displayAllCards", async (req, res) => {
  try {
    const cards = await Profil.find();
    if (!cards || cards.length === 0) {
      return res
        .status(400)
        .json({ result: false, error: ErrorMessages.NOT_CARD_FOR_USER });
    }
    return res.json({ result: true, cards });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ result: false, error: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

>>>>>>> e74dba2ae98086db3f231aec128979c26b98c9c9
module.exports = router;
