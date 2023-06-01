var express = require("express");
var router = express.Router();
const { ErrorMessages, HttpStatus } = require("../errors/error_messages");

const Profil = require("../models/profils");
const User = require("../models/users");

// add une carte de visite a l'utilisateur
router.post("/addProfil", async (req, res) => {
  const {
    uniqueId,
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
  if (!uniqueId || !title || !firstname) {
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
    name,
    adress,
    city,
    postalCode,
    phone,
    email,
    website,
    description,
    image,
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
        name,
        adress,
        city,
        postalCode,
        phone,
        email,
        website,
        description,
        image,
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

module.exports = router;
