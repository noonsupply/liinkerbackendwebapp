const express = require("express");
const Role = require("../../models/v1/roles"); // Assurez-vous que le chemin d'accès est correct pour votre structure de projet.
const User = require("../../models/v1/users");
const { ErrorMessages, HttpStatus } = require("../../errors/error_messages");

const router = express.Router();

// Récupérer tous les rôles
router.get("/roles", async (req, res) => {
  try {
    const existingRoles = await Role.find();
    if (!existingRoles.length) {
      return res.status(404).json({ message: "Cannot find roles" });
    }
    return res.json({
      result: true,
      rolesLength: existingRoles.length,
      roles: existingRoles,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Supprimer un rôle par ID
router.delete("/deleteRole/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const existingRole = await Role.findByIdAndDelete(id);
    if (!existingRole) {
      return res.status(404).json({ message: "Cannot find role" });
    }
    return res.json({ result: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

// Créer un nouveau rôle
router.post("/createRole", async (req, res) => {
  const { roleName, uniqueId } = req.body;

  if (!uniqueId || !roleName) {
    return res
      .status(400)
      .json({ result: false, error: ErrorMessages.MISSING_FIELDS });
  }
  try {
    const user = await User.findOne({ uniqueId });
    if (!user) {
      return res
        .status(400)
        .json({ result: false, error: ErrorMessages.USER_NOT_FOUND });
    }
    const newRole = new Role({
      userId: user._id,
      role: roleName,
    });

    const savedRole = await newRole.save();
    return res.json({ result: true, savedRole });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Trouver un rôle par ID
router.get("/role/:roleId", async (req, res) => {
  try {
    const role = await Role.findOne({ _id: req.params.roleId });
    if (!role) {
      return res.status(404).json({ message: "Cannot find role" });
    }
    res.json(role);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
