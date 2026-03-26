const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  address: {
    street: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, default: '' },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 }
    }
  },
  images: [{
    type: String
  }],
  amenities: [{
    type: String
  }],
  sustainability: {
    score: { type: Number, default: 0, min: 0, max: 100 },
    certified: { type: Boolean, default: false },
    certificationDate: { type: Date },
    solarPowered: { type: Boolean, default: false },
    rainwaterHarvesting: { type: Boolean, default: false },
    organicFood: { type: Boolean, default: false },
    wasteRecycling: { type: Boolean, default: false },
    electricVehicleCharging: { type: Boolean, default: false },
    carbonOffset: { type: Boolean, default: false },
    localSourcing: { type: Boolean, default: false },
    energyEfficient: { type: Boolean, default: false }
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
    createdAt: { type: Date, default: Date.now }
  }],
  policies: {
    checkIn: { type: String, default: '14:00' },
    checkOut: { type: String, default: '11:00' },
    cancellation: { type: String, default: 'Free cancellation up to 24 hours before check-in' },
    petFriendly: { type: Boolean, default: false }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  contactEmail: {
    type: String,
    required: true
  },
  contactPhone: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['luxury', 'boutique', 'budget', 'eco-lodge', 'resort', 'hostel', 'villa'],
    default: 'boutique'
  },
  totalRooms: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

hotelSchema.methods.calculateSustainabilityScore = function() {
  const factors = [
    this.sustainability.solarPowered,
    this.sustainability.rainwaterHarvesting,
    this.sustainability.organicFood,
    this.sustainability.wasteRecycling,
    this.sustainability.electricVehicleCharging,
    this.sustainability.carbonOffset,
    this.sustainability.localSourcing,
    this.sustainability.energyEfficient
  ];
  const trueCount = factors.filter(Boolean).length;
  this.sustainability.score = Math.round((trueCount / factors.length) * 100);
  if (this.sustainability.score >= 75) {
    this.sustainability.certified = true;
    this.sustainability.certificationDate = new Date();
  }
  return this.sustainability.score;
};

hotelSchema.index({ 'address.city': 1, isVerified: 1 });
hotelSchema.index({ 'sustainability.score': -1 });

module.exports = mongoose.model('Hotel', hotelSchema);
