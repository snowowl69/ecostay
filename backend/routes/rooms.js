const express = require('express');
const { body, validationResult } = require('express-validator');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get rooms for a hotel (public)
router.get('/hotel/:hotelId', async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    const rooms = await Room.find({ hotel: req.params.hotelId, isActive: true });

    if (checkIn && checkOut) {
      const roomsWithAvailability = rooms.map(room => {
        const available = room.checkAvailability(checkIn, checkOut);
        const availableUnits = room.getAvailableUnits(checkIn, checkOut);
        return {
          ...room.toObject(),
          isAvailable: available,
          availableUnits
        };
      });
      return res.json(roomsWithAvailability);
    }

    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single room
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel');
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create room (owner only)
router.post('/', protect, authorize('owner', 'admin'), [
  body('hotel').notEmpty().withMessage('Hotel ID is required'),
  body('name').trim().notEmpty().withMessage('Room name is required'),
  body('type').isIn(['single', 'double', 'suite', 'deluxe', 'penthouse', 'eco-pod', 'treehouse', 'cottage']),
  body('price.base').isNumeric().withMessage('Base price is required'),
  body('totalUnits').isInt({ min: 1 }).withMessage('Total units must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const hotel = await Hotel.findById(req.body.hotel);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    if (hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const room = await Room.create(req.body);

    hotel.totalRooms = await Room.countDocuments({ hotel: hotel._id, isActive: true });
    await hotel.save();

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update room (owner only)
router.put('/:id', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const hotel = await Hotel.findById(room.hotel);
    if (hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete room (owner only)
router.delete('/:id', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const hotel = await Hotel.findById(room.hotel);
    if (hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    room.isActive = false;
    await room.save();

    hotel.totalRooms = await Room.countDocuments({ hotel: hotel._id, isActive: true });
    await hotel.save();

    res.json({ message: 'Room deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check availability
router.post('/check-availability', async (req, res) => {
  try {
    const { roomId, checkIn, checkOut, units = 1 } = req.body;
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const isAvailable = room.checkAvailability(checkIn, checkOut, units);
    const availableUnits = room.getAvailableUnits(checkIn, checkOut);

    res.json({ isAvailable, availableUnits, totalUnits: room.totalUnits });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
