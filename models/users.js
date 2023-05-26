const mongoose = require("mongoose");

const profilSchema = new mongoose.Schema({
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
});

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    // You should hash passwords before saving to DB
    type: String,
    required: true,
  },
  photo: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  uniqueId: { type: String, unique: true }, //token uuid4
  profil: [profilSchema], // sous-documents
});

module.exports = mongoose.model("users", UserSchema);
