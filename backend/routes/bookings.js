const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, authorize('customer'), [
  body('hotel').notEmpty(),
  body('room').notEmpty(),
  body('checkIn').notEmpty(),
  body('checkOut').notEmpty(),
  body('guests.adults').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { hotel: hotelId, room: roomId, checkIn, checkOut, guests, unitsBooked = 1, specialRequests, paymentMethod } = req.body;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ message: 'Check-out must be after check-in' });
    }
    if (checkInDate < new Date()) {
      return res.status(400).json({ message: 'Check-in date cannot be in the past' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const isAvailable = room.checkAvailability(checkIn, checkOut, unitsBooked);
    if (!isAvailable) {
      return res.status(400).json({ message: 'Room is not available for selected dates' });
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const totalPrice = room.price.base * nights * unitsBooked;

    const booking = await Booking.create({
      user: req.user._id,
      hotel: hotelId,
      room: roomId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guests || { adults: 1, children: 0 },
      unitsBooked,
      totalPrice,
      currency: room.price.currency,
      specialRequests,
      paymentMethod: paymentMethod || 'credit-card',
      status: 'confirmed',
      paymentStatus: 'paid'
    });

    room.bookedDates.push({
      startDate: checkInDate,
      endDate: checkOutDate,
      bookingId: booking._id,
      unitsBooked
    });
    await room.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('hotel', 'name address images')
      .populate('room', 'name type price images')
      .populate('user', 'name email');

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/my-bookings', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(filter)
      .populate('hotel', 'name address images sustainability')
      .populate('room', 'name type price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      bookings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/hotel/:hotelId', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    if (hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { status, page = 1, limit = 20 } = req.query;
    const filter = { hotel: req.params.hotelId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone')
      .populate('room', 'name type price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(filter);

    res.json({
      bookings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('hotel', 'name address images contactEmail contactPhone policies sustainability')
      .populate('room', 'name type price images amenities')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      const hotel = await Hotel.findById(booking.hotel._id);
      if (!hotel || hotel.owner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id/status', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    if (status === 'cancelled' || status === 'refunded') {
      booking.paymentStatus = status === 'refunded' ? 'refunded' : booking.paymentStatus;
      const room = await Room.findById(booking.room);
      if (room) {
        room.bookedDates = room.bookedDates.filter(
          bd => bd.bookingId.toString() !== booking._id.toString()
        );
        await room.save();
      }
    }

    await booking.save();

    const updated = await Booking.findById(booking._id)
      .populate('hotel', 'name address')
      .populate('room', 'name type price')
      .populate('user', 'name email');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (['cancelled', 'checked-out', 'refunded'].includes(booking.status)) {
      return res.status(400).json({ message: 'Booking cannot be cancelled' });
    }

    booking.status = 'cancelled';
    booking.paymentStatus = 'refunded';

    const room = await Room.findById(booking.room);
    if (room) {
      room.bookedDates = room.bookedDates.filter(
        bd => bd.bookingId.toString() !== booking._id.toString()
      );
      await room.save();
    }

    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/ticket/:ticketNumber', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({ ticketNumber: req.params.ticketNumber })
      .populate('hotel', 'name address images')
      .populate('room', 'name type price')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
