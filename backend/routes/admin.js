const express = require('express');
const Hotel = require('../models/Hotel');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalHotels = await Hotel.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalRooms = await Room.countDocuments();

    const pendingVerifications = await Hotel.countDocuments({ isVerified: false, isActive: true });
    const activeBookings = await Booking.countDocuments({ status: { $in: ['confirmed', 'checked-in'] } });

    const revenueAgg = await Booking.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    const customerCount = await User.countDocuments({ role: 'customer' });
    const ownerCount = await User.countDocuments({ role: 'owner' });

    const certifiedHotels = await Hotel.countDocuments({ 'sustainability.certified': true });

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyBookings = await Booking.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalUsers,
      totalHotels,
      totalBookings,
      totalRooms,
      pendingVerifications,
      activeBookings,
      totalRevenue,
      customerCount,
      ownerCount,
      certifiedHotels,
      monthlyBookings
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/hotels', async (req, res) => {
  try {
    const { verified, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (verified !== undefined) filter.isVerified = verified === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const hotels = await Hotel.find(filter)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Hotel.countDocuments(filter);

    res.json({
      hotels,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/hotels/:id/verify', async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).populate('owner', 'name email');

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    res.json({ message: 'Hotel verified successfully', hotel });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/hotels/:id/unverify', async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { isVerified: false },
      { new: true }
    ).populate('owner', 'name email');

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    res.json({ message: 'Hotel unverified', hotel });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/bookings', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const bookings = await Booking.find(filter)
      .populate('user', 'name email')
      .populate('hotel', 'name address')
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
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
