const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const {
      city, country, category, minPrice, maxPrice,
      minSustainability, amenities, sort, page = 1, limit = 12,
      search
    } = req.query;

    const filter = { isVerified: true, isActive: true };

    if (city) filter['address.city'] = new RegExp(city, 'i');
    if (country) filter['address.country'] = new RegExp(country, 'i');
    if (category) filter.category = category;
    if (minSustainability) filter['sustainability.score'] = { $gte: parseInt(minSustainability) };
    if (amenities) filter.amenities = { $all: amenities.split(',') };
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { 'address.city': new RegExp(search, 'i') },
        { 'address.country': new RegExp(search, 'i') }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { 'price': 1 };
    if (sort === 'price-high') sortOption = { 'price': -1 };
    if (sort === 'rating') sortOption = { 'rating.average': -1 };
    if (sort === 'sustainability') sortOption = { 'sustainability.score': -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const hotels = await Hotel.find(filter)
      .populate('owner', 'name email')
      .sort(sortOption)
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/owner/my-hotels', protect, authorize('owner'), async (req, res) => {
  try {
    const hotels = await Hotel.find({ owner: req.user._id });
    res.json({ hotels });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate('reviews.user', 'name avatar');

    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const rooms = await Room.find({ hotel: hotel._id, isActive: true });

    res.json({ hotel, rooms });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', protect, authorize('owner', 'admin'), [
  body('name').trim().notEmpty().withMessage('Hotel name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('address.city').trim().notEmpty().withMessage('City is required'),
  body('address.state').trim().notEmpty().withMessage('State is required'),
  body('address.country').trim().notEmpty().withMessage('Country is required'),
  body('contactEmail').isEmail().withMessage('Valid contact email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const hotelData = { ...req.body, owner: req.user._id };
    const hotel = await Hotel.create(hotelData);

    hotel.calculateSustainabilityScore();
    await hotel.save();

    res.status(201).json(hotel);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    let hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    if (hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this hotel' });
    }

    hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    hotel.calculateSustainabilityScore();
    await hotel.save();

    res.json(hotel);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', protect, authorize('owner', 'admin'), async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    if (hotel.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    hotel.isActive = false;
    await hotel.save();

    res.json({ message: 'Hotel deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/:id/reviews', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    const existingReview = hotel.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this hotel' });
    }

    hotel.reviews.push({
      user: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment
    });

    const totalRating = hotel.reviews.reduce((sum, r) => sum + r.rating, 0);
    hotel.rating.average = (totalRating / hotel.reviews.length).toFixed(1);
    hotel.rating.count = hotel.reviews.length;

    await hotel.save();

    const populated = await Hotel.findById(hotel._id)
      .populate('reviews.user', 'name avatar');

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
