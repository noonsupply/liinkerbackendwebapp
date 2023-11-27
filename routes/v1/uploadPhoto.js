var express = require("express");
var router = express.Router();
require("../../models/v1/connection");

const cloudinary = require("cloudinary").v2;
const uniqid = require("uniqid");
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* recupere la photo en db, utile ???? preferable de recuperer la photo depuis le store redux ???, ou utiliser le middleware ... */
router.get("/getPhoto/:username", (req, res) => {
  const username = req.params.username;
  User.findOne({ username }).then((data) => {
    if (data) {
      res.json({ result: true, data: data.photo });
    }
  });
});

/* enregistrement sur cloudinary de la photo */
router.put("/upload/:token", async (req, res) => {
  const photoPath = `./tmp/${uniqid()}.jpg`;
  console.log("req.file", req.files.userPhoto);
  const resultMove = await req.files.userPhoto.mv(photoPath);
  console.log("resultMove", resultMove);
  if (!resultMove) {
    const resultCloudinary = await cloudinary.uploader.upload(photoPath);
    User.findOneAndUpdate(
      { token: req.params.token },
      //The $set operator is a MongoDB operator that is used to update specific fields in a document. It replaces the value of a field with the specified value.
      { $set: { photo: resultCloudinary.secure_url } },
      //The new: true option is used in MongoDB to specify that the updated document should be returned in the response.
      { new: true }
    ).then((updatedUser) => {
      if (!updatedUser) {
        res.json({ error: "User not found" });
      } else {
        res.json({ result: true, user: updatedUser });
      }
    });
    fs.unlinkSync(photoPath);
  }
});

// Récupère toutes les images d'un dossier spécifique sur Cloudinary
router.get("/getAllImagesFromFolder", async (req, res) => {
  try {
    const resultCloudinary = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'Liinker/cardBackground/', // chemin du dossier
      max_results: 100
    });

    const imageUrls = resultCloudinary.resources.map(image => image.secure_url);
    res.json({ result: true, images: imageUrls });

  } catch (error) {
    console.error("Erreur lors de la récupération des images:", error);
    res.status(500).json({ result: false, message: "Erreur serveur" });
  }
});



module.exports = router;
