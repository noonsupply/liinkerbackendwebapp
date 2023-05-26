const mongoose = require("mongoose");

const profilSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "users",
    required: true,
    unique: true,
  },
  firstname: { type: String, trim: true },
  lastName: { type: String, trim: true },
  jobTitle: { type: String, trim: true },
  email: { type: String, trim: true },
  website: { type: String, trim: true },
  phone: { type: String, trim: true },
  address: { type: String, trim: true },
  city: { type: String, trim: true },
  linkedin: { type: String, trim: true },
  snapchat: { type: String, trim: true },
  instagram: { type: String, trim: true },

  // trim supprime les espaces inutiles  avant et aprés la chaine de caractere
});

module.exports = mongoose.model("profils", profilSchema);
