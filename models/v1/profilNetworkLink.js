
const mongoose = require('mongoose');

const profilNetworkLinkSchema = new mongoose.Schema({
    profileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'profils',
        required: true
      },
    networkName: {
    type: String,
    required: true
  },
  linkUrl: {
    type: String,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
    updatedAt: {
        type: Date,
        default: null
    }
    ,
});

const ProfilNetworkLink = mongoose.model('profilNetworkLink', profilNetworkLinkSchema);

module.exports = ProfilNetworkLink;
