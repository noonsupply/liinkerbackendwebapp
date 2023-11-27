const mongoose = require('mongoose');

const GPSPositionSchema = new mongoose.Schema({
  uniqueId: {
    type: String,
    ref: 'users',
    required: true
  },
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'profils',
    required: true
  },
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

GPSPositionSchema.index({ coordinates: '2dsphere' });

module.exports = mongoose.model('gpsPosition', GPSPositionSchema);

