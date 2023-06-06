const express = require("express");
const Room = require("../models/rooms");
const User = require("../models/users");
const { ErrorMessages, HttpStatus } = require("../errors/error_messages");


const router = express.Router();

router.post("/createRooms", async (req, res) => {

  const { roomId, roomName, uniqueId } = req.body;

  if (!uniqueId || !roomId || !roomName) {
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
  const newRoom = new Room({
    userId: user._id,
    roomId: req.body.roomId,
    roomName: req.body.roomName,
  });

    const saveNewRoom = await newRoom.save();
    return res.json({result: true, saveNewRoom});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/rooms/:roomId", async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (room == null) {
      return res.status(404).json({ message: "Cannot find room" });
    }
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
