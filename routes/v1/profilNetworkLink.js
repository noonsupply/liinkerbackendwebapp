const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const ProfilNetworkLink = require('../../models/v1/profilNetworkLink');
const profilnetworklinkRouter = express.Router();

const app = express();
app.use(express.json()); 

// Route POST pour ajouter un lien de réseau social
router.post('/addProfilNetworkLink', async (req, res) => {
  try {
    const { profileId, networkName, linkUrl } = req.body;

    console.log(req.body)

    const newLink = new ProfilNetworkLink({
      profileId,
      networkName,
      linkUrl
    });

    await newLink.save();
    res.status(201).json(newLink);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route GET pour récupérer tous les liens de réseaux sociaux

router.get('/getProfilNetworkLinks/:profilId', async (req, res) => {
  try {
    // Récupérer l'ID du profil à partir des paramètres de la requête
    const profilId = req.params.profilId;

    // Filtrer les liens de réseau social en fonction de l'ID du profil
    const links = await ProfilNetworkLink.find({ profileId: profilId });
    
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route DELETE pour supprimer un lien de réseau social
router.delete('/deleteProfilNetworkLink/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // Utilisez findByIdAndRemove pour supprimer directement le document
    const result = await ProfilNetworkLink.findByIdAndRemove(id);

    if (!result) {
      res.status(404).json({ message: 'Link not found' });
    } else {
      res.json({ message: 'Link deleted' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Route PUT pour mettre à jour un lien de réseau social
router.put('/updateProfilNetworkLink/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const link = await ProfilNetworkLink.findById(id);

    if (!link) {
      res.status(404).json({ message: 'Link not found' });
    } else {
      const { profileId, networkName, linkUrl } = req.body;

      link.profileId = profileId;
      link.networkName = networkName;
      link.linkUrl = linkUrl;

      await link.save();

      res.json(link);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
