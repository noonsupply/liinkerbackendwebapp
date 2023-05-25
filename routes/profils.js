var express = require("express");
var router = express.Router();
const Profil = require("../models/profils");
const User = require("../models/users");

//post a profil
router.post("/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const data = await User.findOne({ token });
    if (!data) {
      return res.status(400).json({ result: false, error: "User not found !" });
    }
    const newProfil = new Profil({
      userId: data._id,
    });
    const saveProfil = newProfil.save();
    return res.json({ result: true, saveProfil });
  } catch (err) {
    return res.status(500).json({ result: false, error: err.message });
  }
});

module.exports = router;
