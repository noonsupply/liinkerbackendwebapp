const mongoose = require("mongoose");

const Profilchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  firstname: String,
  lastName: String,
  jobTitle: String,
  email: String,
  website: String,
  phone: String,
  adress: String,
  city: String,
  linkedin: String,
  snapchat: String,
  instagram: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  user: String,
});

module.exports = mongoose.model("profils", Profilchema);
