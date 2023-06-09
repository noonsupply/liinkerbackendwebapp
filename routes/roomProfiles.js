const express = require('express');
const RoomProfile = require('../models/roomProfiles');
const router = express.Router();
const Room = require('../models/rooms');

router.post('/ajouter-room', async (req, res) => {
  const { roomId, userId } = req.body;

  try {
    // Vérifier si la room existe
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ error: 'La room n\'existe pas' });
    }

    // Vérifier si le RoomProfile existe déjà pour cet utilisateur
    const existingProfile = await RoomProfile.findOne({ roomId, profileId: userId });

    if (existingProfile) {
      return res.status(409).json({ error: 'Utilisateur déjà présent dans la room' });
    }

    // Calculer la date et heure de validité
    const validity = new Date();
    validity.setHours(validity.getHours() + 5);

    // Créer une nouvelle instance de RoomProfile
    const roomProfile = new RoomProfile({
      roomId,
      profileId: userId,
      validity,
    });

    // Enregistrer le RoomProfile dans la base de données
    await roomProfile.save();

    return res.status(200).json({ message: 'Utilisater ajoutée avec succès dans la room' });
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
