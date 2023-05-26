var express = require("express");
var router = express.Router();

const Profil = require("../models/profils");
const User = require("../models/users");

// add une carte de visite a l'utilisateur
router.post("/addProfil", async (req, res) => {
  const { uniqueId } = req.body;
  try {
    const user = await User.findOne({ uniqueId });
    if (!user) {
      return res.status(400).json({ result: false, error: "User not found" });
    }
    const newProfil = new Profil({
      userId: user._id,
    });
    const saveNewProfil = await newProfil.save();
    return res.json({ result: true, saveNewProfil });
  } catch (err) {
    res.status(500).json({ result: false, error: err.message });
  }
});

// recupere toutes les cartes d'un utilisateur
router.get("/displayCard/:uniqueId", async (req, res) => {
  const { uniqueId } = req.params;
  try {
    const user = await User.findOne({ uniqueId });
    if (!user) {
      return res.status(400).json({ result: false, error: "User not found" });
    }
    const card = await Profil.findOne({ userId: user._id });
    if (!card) {
      return res
        .status(400)
        .json({ result: false, error: "Not card currently for this user" });
    }
    return res.json({ result: true, card });
  } catch (err) {
    console.log(err);
    res.status(500).json({ result: false, error: "Internal servor error" });
  }
});

module.exports = router;
