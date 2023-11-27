const mongoose = require('mongoose');

const usercontactSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true 
  },
  contacts: [{ 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'profils'
  }]
});

module.exports = mongoose.model('usercontacts', usercontactSchema);


