const mongoose = require("mongoose");
const { parsePhoneNumberFromString } = require('libphonenumber-js');

const profilNetworkLinkSchema = new mongoose.Schema({
  networkName: { type: String, required: true, trim: true },
  linkUrl: { type: String, required: true, trim: true },
  addedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: null },
});

const profilSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  backgroundImage: { type: String },
  profilImage: {type: String, trim: true},
  companyLogo: {type: String},
  firstname: { type: String, trim: true, set: v => v.replace(/\s+/g, '').toLowerCase() },
  lastname: { type: String, trim: true, set: v => v.replace(/\s+/g, '').toLowerCase() },
  jobTitle: { type: String, trim: true, set: v => v.replace(/\s+/g, '').toLowerCase() },
  email: { type: String, trim: true, set: v => v.replace(/\s+/g, '').toLowerCase() },
  website: { type: String, trim: true, set: v => v.replace(/\s+/g, '').toLowerCase() },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        const phoneNumber = parsePhoneNumberFromString(v);
        return phoneNumber ? phoneNumber.isValid() : false;
      },
      message: props => `${props.value} n'est pas un numéro de téléphone valide!`
    },
    required: [true, 'Le numéro de téléphone est requis']
  },
  address: { type: String, trim: true, set: v => v.replace(/\s+/g, '').toLowerCase() },
  city: { type: String, trim: true, set: v => v.replace(/\s+/g, '').toLowerCase() },
  country: { type: String, trim: true, set: v => v.replace(/\s+/g, '').toLowerCase() },
  postalCode: { type: String, trim: true },
  companyName : {type: String, trim: true, set: v => v.replace(/\s+/g, '').toLowerCase()},
  tags: {
    type: [String],
    set: v => v.map(tag => tag.trim())
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: false },  
  networkLinks: [profilNetworkLinkSchema],
  // trim supprime les espaces inutiles  avant et aprés la chaine de caractere
});

module.exports = mongoose.model("profils", profilSchema);
