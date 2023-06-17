const mongoose = require('mongoose');

const userContactsSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',  // Assurez-vous que 'User' est le nom du modèle User
    required: true 
  },
  contacts: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'profils'  // Assurez-vous que 'Profile' est le nom du modèle Profile
  }]
});

const UserContacts = mongoose.model('UserContacts', userContactsSchema);

module.exports = UserContacts;