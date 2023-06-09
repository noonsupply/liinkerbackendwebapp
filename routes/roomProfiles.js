const express = require('express');
const RoomProfile = require('../models/roomProfiles');
const router = express.Router();
const Room = require('../models/rooms');
const User = require("../models/users");
const Profil = require("../models/profils");

const mongoose = require('mongoose');

router.post('/addingUserInRoom', async (req, res) => {
  const { roomId, uniqueId, profileId } = req.body;

  // Assurez-vous que tous les champs requis sont présents
  if (!roomId || !uniqueId || !profileId) {
    return res.status(400).json({ result: false, error: ErrorMessages.MISSING_FIELDS });
  }

  try {
    // Vérifier si la room existe
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ error: 'La room n\'existe pas' });
    }

    // Vérifier si le RoomProfile existe déjà pour cet utilisateur
    const existingProfile = await RoomProfile.findOne({ roomId, profileId });

    if (existingProfile) {
      return res.status(409).json({ error: 'Utilisateur déjà présent dans la room' });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ uniqueId: uniqueId });

    if (!user) {
      return res.status(404).json({ error: 'L\'utilisateur n\'existe pas' });
    }

    // Calculer la date et heure de validité
    const validity = new Date();
    validity.setHours(validity.getHours() + 5);

    // Créer une nouvelle instance de RoomProfile
    const roomProfile = new RoomProfile({
      roomId,
      userId: user._id,
      profileId,
      validity,
    });

    // Enregistrer le RoomProfile dans la base de données
    await roomProfile.save();

    return res.status(200).json({ message: 'Utilisateur ajouté avec succès dans la room' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erreur lors de l\'ajout de la room' });
  }
});







  

  router.get('/room-profiles/:roomId', async (req, res) => {
    try {
      const roomProfiles = await RoomProfile.find({ roomId: req.params.roomId }).populate('profileId');
      if (roomProfiles == null) {
        return res.status(404).json({ message: 'Cannot find profiles' });
      }
      res.json(roomProfiles);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  module.exports = router;
