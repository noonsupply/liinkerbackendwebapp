var express = require("express");
var router = express.Router();
const { ErrorMessages, HttpStatus } = require("../../errors/error_messages");

const Profil = require("../../models/v1/profils");
const User = require("../../models/v1/users");

// Ajouter une carte de visite à l'utilisateur
router.post("/addProfil", async (req, res) => {
  const { uniqueId, networkLinks, ...otherFields } = req.body;

  if (!uniqueId || !otherFields.lastname || !otherFields.firstname) {
    return res.status(400).json({ result: false, error: ErrorMessages.MISSING_FIELDS });
  }

  try {
    // Trouver l'utilisateur correspondant à l'uniqueId
    const user = await User.findOne({ uniqueId });
    if (!user) {
      return res.status(400).json({ result: false, error: ErrorMessages.USER_NOT_FOUND });
    }

    // Créer un nouveau profil avec l'ObjectId de l'utilisateur
    const newProfil = new Profil({
      userId: user._id,
      networkLinks,
      ...otherFields
    });

    const savedProfil = await newProfil.save();
    return res.json({ result: true, savedProfil });
  } catch (err) {
    if (err.name === 'ValidationError') {
      // Renvoie un message d'erreur personnalisé pour les erreurs de validation
      return res.status(400).json({ result: false, error: err.message });
    }
    console.error(err);
    res.status(500).json({ result: false, error: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});


// Afficher les cartes par utilisateur
router.get("/displayCard/:uniqueId", async (req, res) => {
  const { uniqueId } = req.params;

  try {
    const user = await User.findOne({ uniqueId });
    if (!user) {
      return res.status(400).json({ result: false, error: ErrorMessages.USER_NOT_FOUND });
    }

    const profiles = await Profil.find({ userId: user._id });
    if (!profiles.length) {
      return res.status(400).json({ result: false, error: ErrorMessages.NOT_CARD_FOR_USER });
    }

    return res.json({ result: true, profiles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: false, error: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

// Modifier une carte
router.put("/updateCard/:uniqueId/:profilId", async (req, res) => {
  const { uniqueId, profilId } = req.params;
  const updateFields = req.body;

  try {
    const user = await User.findOne({ uniqueId });
    if (!user) {
      return res.status(400).json({ result: false, error: ErrorMessages.USER_NOT_FOUND });
    }

    const updatedProfil = await Profil.findOneAndUpdate(
      { userId: user._id, _id: profilId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedProfil) {
      return res.status(400).json({ result: false, error: ErrorMessages.NOT_CARD_FOR_USER });
    }

    return res.json({ result: true, updatedProfil });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ result: false, error: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

// Supprimer une carte de visite
router.delete("/deleteCard/:uniqueId/:profilId", async (req, res) => {
  const { uniqueId, profilId } = req.params;

  try {
    const user = await User.findOne({ uniqueId });
    if (!user) {
      return res.status(400).json({ result: false, error: ErrorMessages.USER_NOT_FOUND });
    }

    const deletedProfil = await Profil.findOneAndDelete({ _id: profilId, userId: user._id });
    if (!deletedProfil) {
      return res.status(400).json({ result: false, error: ErrorMessages.NOT_CARD_FOR_USER });
    }

    return res.json({ result: true, message: "Card deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ result: false, error: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

// Obtenir les détails d'une carte
router.get("/getCardDetail/:profilId", async (req, res) => {
  const { profilId } = req.params;

  try {
    const profile = await Profil.findById(profilId).populate("userId");
    if (!profile) {
      return res.status(400).json({ result: false, error: ErrorMessages.NOT_CARD_FOR_USER });
    }

    return res.json({ result: true, profile });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ result: false, error: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

// Afficher toutes les cartes
router.get("/displayAllCards", async (req, res) => {
  try {
    const profiles = await Profil.find();
    if (!profiles.length) {
      return res.status(400).json({ result: false, error: ErrorMessages.NOT_CARD_FOR_USER });
    }

    return res.json({ result: true, profiles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: false, error: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

router.put("/updateProfilPublic/:profilId", async (req, res) => {

  const { profilId } = req.params;
  const { isPublic } = req.body;

  try {
    const updatedProfil = await Profil.findOneAndUpdate(
      { _id: profilId },
      { $set: { isPublic } },
      { new: true, runValidators: true }
    );

    if (!updatedProfil) {
      return res.status(400).json({ result: false, error: ErrorMessages.NOT_CARD_FOR_USER });
    }

    return res.json({ result: true, updatedProfil });
  }
  catch (error) {
    console.error(error);
    return res.status(500).json({ result: false, error: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}
);

/* router.get("/displayPublicCards", async (req, res) => {
  try {
    const profiles = await Profil.find({ isPublic: true });
    if (!profiles.length) {
      return res.status(400).json({ result: false, error: ErrorMessages.NOT_CARD_FOR_USER });
    }

    return res.json({ result: true, profiles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: false, error: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}
); */
router.get("/displayPublicCards", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const generalTag = req.query.generalTag;
    const specificTags = req.query.specificTags ? req.query.specificTags.split(",") : [];

    const skip = (page - 1) * limit;

    let query = { isPublic: true };

    if (generalTag) {
      // Créer une expression régulière pour le tag général
      const generalTagRegex = new RegExp(generalTag, 'i'); // 'i' pour la recherche insensible à la casse
      query.tags = generalTagRegex;
    }

    if (specificTags.length > 0) {
      // Créer des expressions régulières pour chaque tag spécifique
      const specificTagsRegex = specificTags.map(tag => new RegExp(tag, 'i'));
      query.tags = { $in: specificTagsRegex };
    }

    console.log('Query:', query); // Ajouter ce log pour le débogage

    const profiles = await Profil.find(query).skip(skip).limit(limit);
    if (!profiles.length) {
      return res.status(400).json({ result: false, error: ErrorMessages.NOT_CARD_FOR_USER });
    }

    return res.json({ result: true, profiles });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: false, error: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});




router.get("/displayPublicCardsDetail/:profilId", async (req, res) => {

  const { profilId } = req.params;

  try {
    const profile = await Profil.findById(profilId);
    if (!profile) {
      return res.status(400).json({ result: false, error: ErrorMessages.NOT_CARD_FOR_USER });
    }

    return res.json({ result: true, profile });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ result: false, error: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}
);

router.get('/displayAllTags', async (req, res) => {
  try {
    // Récupération des profils où isPublic est true
    const profiles = await Profil.find({ isPublic: true });

    if (!profiles.length) {
      return res.status(400).json({ result: false, error: ErrorMessages.NOT_CARD_FOR_USER });
    }

    // Extraction des tags uniques
    const uniqueTags = new Set();
    profiles.forEach(profile => {
      profile.tags.forEach(tag => {
        uniqueTags.add(tag);
      });
    });

    // Convertir le Set en Array pour la réponse
    const tagsArray = Array.from(uniqueTags);

    return res.json({ result: true, tags: tagsArray });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: false, error: HttpStatus.INTERNAL_SERVER_ERROR });
  }
});

router.get('/displayAllTags/tags', async (req, res) => {
  try {
    const query = req.query.query || '';
    // Utiliser une expression régulière pour filtrer les tags
    const regex = new RegExp(query, 'i'); // 'i' pour la recherche insensible à la casse

    // Récupérer directement les tags distincts qui correspondent à la requête
    const tags = await Profil.find({ isPublic: true, tags: { $regex: regex } }).distinct('tags');

    if (!tags.length) {
      return res.status(400).json({ result: false, error: "Aucun tag trouvé" });
    }

    return res.json({ result: true, tags: tags });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result: false, error: "Erreur interne du serveur" });
  }
});



module.exports = router;
