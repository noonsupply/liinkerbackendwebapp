const express = require('express');
const RoomProfile = require('../models/roomProfiles');
const router = express.Router();


router.post('/ajouter-room', async (req, res) => {
  const { roomId, userId } = req.body;

  // Vérifier si la room existe
  const roomExists = "";

  if (!roomExists) {
    return res.status(404).json({ error: 'La room n\'existe pas' });
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

  try {
    // Enregistrer le RoomProfile dans la base de données
    await roomProfile.save();
    return res.status(200).json({ message: 'Room ajoutée avec succès' });
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
