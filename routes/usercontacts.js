const express = require('express');
const router = express.Router();
const UserContact = require('../models/usercontacts');
const User = require('../models/users');
const Profil = require('../models/profils');



router.post('/addContact', async (req, res) => {
    const { uniqueId, profileId } = req.body;
  console.log(req.body)
//vérification de la présence des champs
    if (!uniqueId || !profileId) {
      return res
        .status(400)
        .json({ result: false, error: 'Missing unique ID or profile ID' });
    }
  
    try {
      const user = await User.findOne({ uniqueId });
  
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }
  
      let userContact = await UserContact.findOne({ userId: user._id });
  
      if (userContact) {
        // Si un enregistrement UserContact existe déjà, ajoutez le profileId au tableau de contacts
        if (userContact.contacts.includes(profileId)) {
          return res
            .status(409)
            .json({ error: 'Profile already in contacts' });
        } else {
          userContact.contacts.push(profileId);
        }
      } else {
        // Si un enregistrement UserContact n'existe pas, créez-en un
        userContact = new UserContact({
          userId: user._id,
          contacts: [profileId]
        });
      }
  
      // Enregistrer l'objet UserContact dans la base de données
      await userContact.save();
  
      return res
        .status(200)
        .json({ result: true, message: 'Profile added to contacts' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
  

  router.get('/getContacts/:uniqueId', async (req, res) => {
    const { uniqueId } = req.params;
  
    if (!uniqueId) {
      return res.status(400).json({ result: false, error: 'Missing unique ID' });
    }
  
    try {
      const user = await User.findOne({ uniqueId });
  
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }
  
      const userContact = await UserContact.findOne({ userId: user._id }).populate('contacts');
  
      if (!userContact) {
        return res.status(404).json({ error: 'User contacts not found' });
      }
  
      return res.status(200).json({ result: true, contacts: userContact.contacts });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
  
  //create route to get detail from one profil
  router.get('/getProfil/:profilId', async (req, res) => {
    const { profilId } = req.params;
  
    try{
      var profil = await Profil.findOne({ _id: profilId });
      if (!profil) {
        return res.status(404).json({ error: 'Profil not found' });
      }
  
      return res.status(200).json({ result: true, profil });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
  

module.exports = router;
