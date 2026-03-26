const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Room name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['single', 'double', 'suite', 'deluxe', 'penthouse', 'eco-pod', 'treehouse', 'cottage'],
    required: true
  },
  description: {
    type: String,
    maxlength: 1000
  },
  price: {
    base: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  },
  capacity: {
    adults: { type: Number, default: 2 },
    children: { type: Number, default: 1 }
  },
  amenities: [{
    type: String
  }],
  images: [{
    type: String
  }],
  totalUnits: {
    type: Number,
    required: true,
    default: 1
  },
  bookedDates: [{
    startDate: { type: Date },
    endDate: { type: Date },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    unitsBooked: { type: Number, default: 1 }
  }],
  ecoFeatures: {
    bambooFurniture: { type: Boolean, default: false },
    organicLinens: { type: Boolean, default: false },
    lowFlowFixtures: { type: Boolean, default: false },
    ledLighting: { type: Boolean, default: false },
    recycledMaterials: { type: Boolean, default: false }
  },
  floorArea: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

roomSchema.methods.checkAvailability = function(checkIn, checkOut, unitsNeeded = 1) {
  const requestStart = new Date(checkIn);
  const requestEnd = new Date(checkOut);

  for (let d = new Date(requestStart); d < requestEnd; d.setDate(d.getDate() + 1)) {
    let bookedUnits = 0;
    for (const booking of this.bookedDates) {
      const bStart = new Date(booking.startDate);
      const bEnd = new Date(booking.endDate);
      if (d >= bStart && d < bEnd) {
        bookedUnits += booking.unitsBooked;
      }
    }
    if (bookedUnits + unitsNeeded > this.totalUnits) {
      return false;
    }
  }
  return true;
};

roomSchema.methods.getAvailableUnits = function(checkIn, checkOut) {
  const requestStart = new Date(checkIn);
  const requestEnd = new Date(checkOut);
  let minAvailable = this.totalUnits;

  for (let d = new Date(requestStart); d < requestEnd; d.setDate(d.getDate() + 1)) {
    let bookedUnits = 0;
    for (const booking of this.bookedDates) {
      const bStart = new Date(booking.startDate);
      const bEnd = new Date(booking.endDate);
      if (d >= bStart && d < bEnd) {
        bookedUnits += booking.unitsBooked;
      }
    }
    const available = this.totalUnits - bookedUnits;
    if (available < minAvailable) minAvailable = available;
  }
  return minAvailable;
};

module.exports = mongoose.model('Room', roomSchema);
