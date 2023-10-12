const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    userId: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true 
    },
    subscriptionType: { 
      type: String, 
      required: true 
    },
    validUntil: { 
      type: Date 
    },
    paymentStatus: { 
      type: String 
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    },
    updatedAt: { 
      type: Date, 
      default: Date.now 
    },
    paymentMethod: { 
      type: String 
    }
  });
  
  module.exports = mongoose.model('subscriptions', subscriptionSchema);