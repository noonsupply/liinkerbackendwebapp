var express = require("express");
var router = express.Router();
require("../models/connection");

const cloudinary = require("cloudinary").v2;
const uniqid = require("uniqid");
const fs = require("fs");

/* recupere la photo en db */
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

module.exports = router;
