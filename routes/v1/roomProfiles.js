const express = require("express");
const RoomProfile = require("../../models/v1/roomProfiles");
const router = express.Router();
const Room = require("../../models/v1/rooms");
const User = require("../../models/v1/users");
const Profil = require("../../models/v1/profils");
const { ErrorMessages, HttpStatus } = require("../../errors/error_messages");

const mongoose = require("mongoose");

router.post("/addingUserInRoom", async (req, res) => {
  const { roomId, uniqueId, profileId } = req.body;

  if (!roomId || !uniqueId || !profileId) {
    return res.status(400).json({ result: false, error: "Champs manquants" });
  }

  try {
    // Vérifier si la room existe
    const room = await Room.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ error: "La room n'existe pas" });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ uniqueId: uniqueId });
    if (!user) {
      return res.status(404).json({ error: "L'utilisateur n'existe pas" });
    }

    // Vérifier si l'utilisateur est déjà enregistré dans la room
    const existingRoomProfile = await RoomProfile.findOne({
      roomId: roomId,
      userId: user._id,
      profileId: profileId
    });

    if (existingRoomProfile) {
      return res.status(409).json({ error: "L'utilisateur est déjà enregistré dans la room" });
    }

    // Calculer la date et heure de validité
    const validity = new Date();
    validity.setHours(validity.getHours() + 5);

    // Créer une nouvelle instance de RoomProfile
    const roomProfile = new RoomProfile({
      roomId,
      userId: user._id,
      profileId,
      validity
    });

    // Enregistrer le RoomProfile dans la base de données
    await roomProfile.save();

    return res.status(200).json({ message: "Utilisateur ajouté avec succès dans la room" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur lors de l'ajout de l'utilisateur dans la room" });
  }
});


//get all the users in a room, uniqueId to avoid his card in results
router.get("/getAllRoomProfiles/:roomId/:uniqueId", async (req, res) => {
  try {
    const roomProfiles = await RoomProfile.find({
      roomId: req.params.roomId,
    }).populate("profileId");

    const user = await User.findOne({ uniqueId: req.params.uniqueId });
    if (!user) {
      return res
        .status(400)
        .json({ result: false, error: ErrorMessages.USER_NOT_FOUND });
    }

    if (!roomProfiles || roomProfiles.length === 0) {
      return res.status(404).json({ message: "Cannot find profiles" });
    }

    // Filtrer pour enlever le profil avec l'userId spécifique
    const filteredRoomProfiles = roomProfiles.filter(profile => profile.profileId.userId.toString() !== user._id.toString());

    res.json({result: true, roomProfiles: filteredRoomProfiles});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


//route to list in which room i'm connected with my uniqueId
router.get("/getRoomProfiles/:uniqueId", async (req, res) => {
  const uniqueId = req.params.uniqueId;
  
  if (!uniqueId) {
    return res.status(400).json({ result: false, message: "Invalid user ID" });
  }

  // Find the user with the specified uniqueId
  const user = await User.findOne({ uniqueId: uniqueId });
  
  // Check if user exists
  if (!user) {
    return res.status(404).json({ result: false, message: "User not found" });
  }
  
  try {
    // Use the user's _id to find associated RoomProfile documents
    const roomProfiles = await Room.find({
      userId: user._id,
    });

    // Check if room profiles exist
    console.log(roomProfiles)

    if (roomProfiles.length === 0) {
      return res.status(404).json({ result: false, message: "No room profiles found for this user" });
    }
    
    const rooms = await Promise.all(roomProfiles.map(async (profile) => {
      const room = await Room.findOne({ roomId: profile.roomId });
      return {...profile._doc, room}; // This adds the room information to the profile
    }));
    
    res.json({result: true, rooms});
  } catch (err) {
    console.log(err); // Log the error to the console
    res.status(500).json({ result: false, message: err.message }); // Return the actual error message
  }
});

//route to delete room
router.delete("/deleteRoomProfile/:id", async (req, res) => {
  try {
    await Room.deleteOne({ _id: req.params.id });
    res.status(200).json({ result: true, message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ result: false, message: err.message });
  }
});

//route to delete room
router.delete("/deleteRoomProfileByRoomId/:roomId", async (req, res) => {
  try {
    await RoomProfile.deleteMany({ roomId: req.params.roomId });
    res.status(200).json({ result: true, message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ result: false, message: err.message });
  }
});





module.exports = router;
