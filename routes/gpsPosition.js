const express = require('express');
const router = express.Router();
const User = require("../models/users");
const GPSPosition = require('../models/gpsPosition');

const { ObjectId } = require('mongodb'); // Ajouter en haut de votre fichier

router.get('/nearby', async (req, res) => {
  let { longitude, latitude, profileId } = req.query;
  const profileIdObj = new ObjectId(profileId);
  console.log("Received profileId:", profileId);

  if (!longitude || !latitude) {
    return res.status(400).json({ message: 'Les coordonnées de longitude et de latitude sont requises.' });
  }

  longitude = parseFloat(longitude);
  latitude = parseFloat(latitude);

  if (
    isNaN(longitude) || longitude < -180 || longitude > 180 || 
    isNaN(latitude) || latitude < -90 || latitude > 90
  ) {
    return res.status(400).json({ message: 'Les coordonnées de longitude et de latitude sont invalides.' });
  }

  const thirtyMinutesAgo = new Date(Date.now() - 60 * 1000);

  try {
    const positions = await GPSPosition.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          distanceField: "dist.calculated",
          maxDistance: 30,
          spherical: true
        }
      },
      {
        $match: {
          updatedAt: {
            $gte: thirtyMinutesAgo
          },
          profileId: {
            $ne: profileIdObj
          }
        }
      },
      {
        $lookup: {
          from: "profils",
          localField: "profileId",
          foreignField: "_id",
          as: "profile"
        }
      }
    ]);

    res.json(positions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});





router.put('/position/:id/gps', async (req, res) => {
  const { id } = req.params;
  const { longitude, latitude, profileId } = req.body;

  // Validation des coordonnées
  if (
    !longitude || !latitude || 
    isNaN(longitude) || longitude < -180 || longitude > 180 || 
    isNaN(latitude) || latitude < -90 || latitude > 90
  ) {
    return res.status(400).json({ message: 'Les coordonnées de longitude et de latitude sont invalides.' });
  }

  try {
    const updatedPosition = await GPSPosition.findOneAndUpdate(
      { profileId: profileId },
      {
        uniqueId: id,
        profileId: profileId,
        type: 'Point',
        coordinates: [longitude, latitude],
        updatedAt: Date.now()
      },
      { 
        upsert: true,  // Créer le document s'il n'existe pas, sinon le mettre à jour
        new: true      // Renvoie le nouveau document mis à jour
      }
    );

    res.json(updatedPosition);
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la position:", err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la position.' });
  }
});


module.exports = router;
