const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Hotel = require('./models/Hotel');
const Room = require('./models/Room');
const Booking = require('./models/Booking');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Hotel.deleteMany({});
    await Room.deleteMany({});
    await Booking.deleteMany({});
    console.log('Cleared existing data');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@ecostay.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91-9800000001',
      isVerified: true
    });

    const owner1 = await User.create({
      name: 'Priya Sharma',
      email: 'priya@ecostay.com',
      password: 'owner123',
      role: 'owner',
      phone: '+91-9800000002',
      isVerified: true
    });

    const owner2 = await User.create({
      name: 'Arjun Patel',
      email: 'arjun@ecostay.com',
      password: 'owner123',
      role: 'owner',
      phone: '+91-9800000003',
      isVerified: true
    });

    const customer1 = await User.create({
      name: 'Ananya Gupta',
      email: 'ananya@example.com',
      password: 'customer123',
      role: 'customer',
      phone: '+91-9800000004'
    });

    const customer2 = await User.create({
      name: 'Rohan Mehta',
      email: 'rohan@example.com',
      password: 'customer123',
      role: 'customer',
      phone: '+91-9800000005'
    });

    console.log('Users created');

    const hotel1 = await Hotel.create({
      name: 'The Green Haven Resort',
      description: 'Nestled in the lush valleys of Himachal Pradesh, The Green Haven Resort is a luxury eco-retreat that combines world-class comfort with deep environmental responsibility. Every aspect of our resort has been designed with sustainability in mind, from our solar-powered facilities to our organic farm-to-table restaurant serving authentic Himachali cuisine.',
      owner: owner1._id,
      address: {
        street: '123 Mall Road',
        city: 'Manali',
        state: 'Himachal Pradesh',
        country: 'India',
        zipCode: '175131',
        coordinates: { lat: 32.2396, lng: 77.1887 }
      },
      images: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800'
      ],
      amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Garden', 'EV Charging', 'Bike Rental', 'Yoga Studio'],
      sustainability: {
        solarPowered: true,
        rainwaterHarvesting: true,
        organicFood: true,
        wasteRecycling: true,
        electricVehicleCharging: true,
        carbonOffset: true,
        localSourcing: true,
        energyEfficient: true
      },
      rating: { average: 4.8, count: 124 },
      policies: {
        checkIn: '14:00',
        checkOut: '11:00',
        cancellation: 'Free cancellation up to 48 hours before check-in',
        petFriendly: true
      },
      isVerified: true,
      contactEmail: 'info@greenhaven.in',
      contactPhone: '+91-1902-252001',
      category: 'resort',
      reviews: [
        { user: customer1._id, rating: 5, comment: 'Absolutely stunning eco-resort! The sustainability practices are genuine and the Himalayan views are unforgettable.' },
        { user: customer2._id, rating: 5, comment: 'Best eco-friendly hotel I have ever stayed at. The organic restaurant serving local Himachali food is amazing!' }
      ]
    });
    hotel1.calculateSustainabilityScore();
    await hotel1.save();

    const hotel2 = await Hotel.create({
      name: 'Bamboo Breeze Eco Lodge',
      description: 'Experience the magic of sustainable living at Bamboo Breeze Eco Lodge in the Western Ghats. Our lodge is constructed entirely from sustainable bamboo and recycled materials. Enjoy panoramic mountain views while knowing your stay contributes to local reforestation efforts in the Nilgiris.',
      owner: owner1._id,
      address: {
        street: '45 Ooty-Mysore Road',
        city: 'Ooty',
        state: 'Tamil Nadu',
        country: 'India',
        zipCode: '643001',
        coordinates: { lat: 11.4102, lng: 76.6950 }
      },
      images: [
        'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800',
        'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800',
        'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800'
      ],
      amenities: ['WiFi', 'Hiking Trails', 'Restaurant', 'Meditation Center', 'Garden', 'Library'],
      sustainability: {
        solarPowered: true,
        rainwaterHarvesting: true,
        organicFood: true,
        wasteRecycling: true,
        electricVehicleCharging: false,
        carbonOffset: true,
        localSourcing: true,
        energyEfficient: true
      },
      rating: { average: 4.6, count: 89 },
      policies: {
        checkIn: '14:00',
        checkOut: '10:00',
        cancellation: 'Free cancellation up to 24 hours before check-in',
        petFriendly: false
      },
      isVerified: true,
      contactEmail: 'hello@bamboobreeze.in',
      contactPhone: '+91-423-2440002',
      category: 'eco-lodge',
      reviews: [
        { user: customer1._id, rating: 5, comment: 'The bamboo architecture is breathtaking! Such a unique eco experience in the Nilgiris.' }
      ]
    });
    hotel2.calculateSustainabilityScore();
    await hotel2.save();

    const hotel3 = await Hotel.create({
      name: 'Ocean Tide Sustainable Hotel',
      description: 'A beachfront sustainable hotel in Goa powered entirely by solar and wind energy. Our zero-waste kitchen serves locally caught seafood and organic produce from our rooftop garden. Watch the sunset from your ocean-view room knowing your stay leaves minimal carbon footprint.',
      owner: owner2._id,
      address: {
        street: '78 Beach Road, Palolem',
        city: 'Goa',
        state: 'Goa',
        country: 'India',
        zipCode: '403702',
        coordinates: { lat: 15.0100, lng: 74.0230 }
      },
      images: [
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
        'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800'
      ],
      amenities: ['WiFi', 'Beach Access', 'Pool', 'Spa', 'Restaurant', 'Surfing', 'EV Charging', 'Rooftop Garden'],
      sustainability: {
        solarPowered: true,
        rainwaterHarvesting: false,
        organicFood: true,
        wasteRecycling: true,
        electricVehicleCharging: true,
        carbonOffset: true,
        localSourcing: true,
        energyEfficient: true
      },
      rating: { average: 4.7, count: 156 },
      isVerified: true,
      contactEmail: 'contact@oceantide.in',
      contactPhone: '+91-832-2640003',
      category: 'luxury',
      reviews: [
        { user: customer2._id, rating: 5, comment: 'Perfect blend of luxury and sustainability. The Goan sunset views are incredible!' }
      ]
    });
    hotel3.calculateSustainabilityScore();
    await hotel3.save();

    const hotel4 = await Hotel.create({
      name: 'Treehouse Canopy Retreat',
      description: 'Live among the treetops in our handcrafted luxury treehouses deep in the forests of Wayanad. Each unit is a self-contained sustainable dwelling with composting toilets, rainwater showers, and solar lighting. A truly magical Kerala forest experience.',
      owner: owner2._id,
      address: {
        street: '12 Vythiri Forest Road',
        city: 'Wayanad',
        state: 'Kerala',
        country: 'India',
        zipCode: '673576',
        coordinates: { lat: 11.6854, lng: 76.1320 }
      },
      images: [
        'https://images.unsplash.com/photo-1618767689160-da3fb810aad7?w=800',
        'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800',
        'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800'
      ],
      amenities: ['WiFi', 'Hiking', 'Bird Watching', 'Nature Tours', 'Campfire', 'Star Gazing'],
      sustainability: {
        solarPowered: true,
        rainwaterHarvesting: true,
        organicFood: true,
        wasteRecycling: true,
        electricVehicleCharging: false,
        carbonOffset: false,
        localSourcing: true,
        energyEfficient: true
      },
      rating: { average: 4.9, count: 67 },
      isVerified: true,
      contactEmail: 'stay@canopyretreat.in',
      contactPhone: '+91-4936-255004',
      category: 'boutique',
      reviews: []
    });
    hotel4.calculateSustainabilityScore();
    await hotel4.save();

    const hotel5 = await Hotel.create({
      name: 'Urban Green Boutique',
      description: 'A chic city boutique hotel in the heart of Bengaluru proving that sustainability and urban luxury can coexist. Our green-certified building features living walls, a rooftop urban farm, and partnerships with local artisans and organic suppliers.',
      owner: owner1._id,
      address: {
        street: '55 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        zipCode: '560001',
        coordinates: { lat: 12.9716, lng: 77.5946 }
      },
      images: [
        'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800',
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'
      ],
      amenities: ['WiFi', 'Gym', 'Restaurant', 'Bar', 'Co-working Space', 'EV Charging', 'Rooftop Terrace'],
      sustainability: {
        solarPowered: true,
        rainwaterHarvesting: true,
        organicFood: false,
        wasteRecycling: true,
        electricVehicleCharging: true,
        carbonOffset: true,
        localSourcing: true,
        energyEfficient: true
      },
      rating: { average: 4.5, count: 203 },
      isVerified: true,
      contactEmail: 'hello@urbangreen.in',
      contactPhone: '+91-80-41500005',
      category: 'boutique'
    });
    hotel5.calculateSustainabilityScore();
    await hotel5.save();

    const hotel6 = await Hotel.create({
      name: 'Sunrise Valley Eco Farm',
      description: 'A working organic farm turned eco-accommodation in the hills of Coorg. Stay in converted heritage cottages, help with daily farm activities, and enjoy the freshest farm-to-table meals with authentic Kodava cuisine.',
      owner: owner2._id,
      address: {
        street: '88 Madikeri Road',
        city: 'Coorg',
        state: 'Karnataka',
        country: 'India',
        zipCode: '571201'
      },
      images: [
        'https://images.unsplash.com/photo-1559599238-308793637427?w=800'
      ],
      amenities: ['WiFi', 'Farm Tours', 'Restaurant', 'Garden'],
      sustainability: {
        solarPowered: true,
        rainwaterHarvesting: true,
        organicFood: true,
        wasteRecycling: true,
        localSourcing: true,
        energyEfficient: true
      },
      isVerified: false,
      contactEmail: 'info@sunrisevalley.in',
      category: 'eco-lodge'
    });
    hotel6.calculateSustainabilityScore();
    await hotel6.save();

    console.log('Hotels created');

    const rooms = [];

    rooms.push(await Room.create({
      hotel: hotel1._id, name: 'Evergreen Suite', type: 'suite',
      description: 'Spacious suite with panoramic Himalayan views, bamboo flooring, and a private balcony surrounded by nature.',
      price: { base: 18999, currency: 'INR' }, capacity: { adults: 2, children: 2 },
      amenities: ['King Bed', 'Balcony', 'Mini Bar', 'Rain Shower', 'Smart TV', 'Coffee Maker'],
      images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'],
      totalUnits: 5, floorArea: 55,
      ecoFeatures: { bambooFurniture: true, organicLinens: true, lowFlowFixtures: true, ledLighting: true, recycledMaterials: true }
    }));

    rooms.push(await Room.create({
      hotel: hotel1._id, name: 'Forest Deluxe Room', type: 'deluxe',
      description: 'Elegant room with floor-to-ceiling windows overlooking the forest canopy.',
      price: { base: 12999, currency: 'INR' }, capacity: { adults: 2, children: 1 },
      amenities: ['Queen Bed', 'Forest View', 'Rain Shower', 'Smart TV'],
      images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
      totalUnits: 12, floorArea: 38,
      ecoFeatures: { bambooFurniture: true, organicLinens: true, lowFlowFixtures: true, ledLighting: true }
    }));

    rooms.push(await Room.create({
      hotel: hotel1._id, name: 'Eco Pod', type: 'eco-pod',
      description: 'Unique geodesic pod with transparent ceiling for stargazing. Minimalist luxury at its finest.',
      price: { base: 8999, currency: 'INR' }, capacity: { adults: 2, children: 0 },
      amenities: ['Double Bed', 'Skylight', 'Heating', 'USB Charging'],
      images: ['https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800'],
      totalUnits: 8, floorArea: 22,
      ecoFeatures: { recycledMaterials: true, ledLighting: true, lowFlowFixtures: true }
    }));

    rooms.push(await Room.create({
      hotel: hotel2._id, name: 'Bamboo Master Suite', type: 'suite',
      description: 'The crown jewel of our lodge, featuring handcrafted bamboo furniture and a private hot tub with mountain views.',
      price: { base: 15999, currency: 'INR' }, capacity: { adults: 2, children: 2 },
      amenities: ['King Bed', 'Hot Tub', 'Mountain View', 'Fireplace', 'Mini Kitchen'],
      images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800'],
      totalUnits: 3, floorArea: 60,
      ecoFeatures: { bambooFurniture: true, organicLinens: true, lowFlowFixtures: true, ledLighting: true, recycledMaterials: true }
    }));

    rooms.push(await Room.create({
      hotel: hotel2._id, name: 'Mountain View Double', type: 'double',
      description: 'Comfortable room with stunning Nilgiri mountain views and eco-friendly amenities.',
      price: { base: 7999, currency: 'INR' }, capacity: { adults: 2, children: 1 },
      amenities: ['Double Bed', 'Mountain View', 'Writing Desk', 'Organic Toiletries'],
      images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'],
      totalUnits: 15, floorArea: 30,
      ecoFeatures: { bambooFurniture: true, organicLinens: true, ledLighting: true }
    }));

    rooms.push(await Room.create({
      hotel: hotel3._id, name: 'Ocean View Penthouse', type: 'penthouse',
      description: 'Exclusive top-floor penthouse with 360-degree ocean views and private terrace overlooking the Arabian Sea.',
      price: { base: 35999, currency: 'INR' }, capacity: { adults: 4, children: 2 },
      amenities: ['2 King Beds', 'Private Terrace', 'Jacuzzi', 'Full Kitchen', 'Living Room', 'Smart Home'],
      images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'],
      totalUnits: 2, floorArea: 120,
      ecoFeatures: { bambooFurniture: true, organicLinens: true, lowFlowFixtures: true, ledLighting: true, recycledMaterials: true }
    }));

    rooms.push(await Room.create({
      hotel: hotel3._id, name: 'Seaside Deluxe', type: 'deluxe',
      description: 'Modern deluxe room with direct beach access and refreshing ocean breezes.',
      price: { base: 16999, currency: 'INR' }, capacity: { adults: 2, children: 1 },
      amenities: ['King Bed', 'Beach Access', 'Balcony', 'Rain Shower'],
      images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800'],
      totalUnits: 20, floorArea: 42,
      ecoFeatures: { organicLinens: true, lowFlowFixtures: true, ledLighting: true }
    }));

    rooms.push(await Room.create({
      hotel: hotel4._id, name: 'Canopy Treehouse', type: 'treehouse',
      description: 'Sleep among the ancient trees of Wayanad in this handcrafted luxury treehouse.',
      price: { base: 22999, currency: 'INR' }, capacity: { adults: 2, children: 1 },
      amenities: ['Queen Bed', 'Private Deck', 'Composting Toilet', 'Solar Shower', 'Telescope'],
      images: ['https://images.unsplash.com/photo-1618767689160-da3fb810aad7?w=800'],
      totalUnits: 6, floorArea: 28,
      ecoFeatures: { bambooFurniture: true, organicLinens: true, lowFlowFixtures: true, ledLighting: true, recycledMaterials: true }
    }));

    rooms.push(await Room.create({
      hotel: hotel5._id, name: 'Urban Green Suite', type: 'suite',
      description: 'Modern city suite with living green wall, smart climate control, and designer eco-furniture.',
      price: { base: 19999, currency: 'INR' }, capacity: { adults: 2, children: 1 },
      amenities: ['King Bed', 'City View', 'Living Green Wall', 'Smart Controls', 'Nespresso'],
      images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'],
      totalUnits: 4, floorArea: 50,
      ecoFeatures: { bambooFurniture: true, organicLinens: true, lowFlowFixtures: true, ledLighting: true }
    }));

    rooms.push(await Room.create({
      hotel: hotel5._id, name: 'Compact Eco Room', type: 'single',
      description: 'Thoughtfully designed compact room proving that small spaces can be luxurious and sustainable.',
      price: { base: 5999, currency: 'INR' }, capacity: { adults: 1, children: 0 },
      amenities: ['Single Bed', 'Workspace', 'Smart TV', 'USB Charging'],
      images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800'],
      totalUnits: 20, floorArea: 18,
      ecoFeatures: { ledLighting: true, lowFlowFixtures: true, recycledMaterials: true }
    }));

    console.log('Rooms created');

    for (const hotel of [hotel1, hotel2, hotel3, hotel4, hotel5]) {
      hotel.totalRooms = await Room.countDocuments({ hotel: hotel._id });
      await hotel.save();
    }

    const futureDate1 = new Date('2026-03-15');
    const futureDate2 = new Date('2026-03-20');
    const futureDate3 = new Date('2026-04-01');
    const futureDate4 = new Date('2026-04-05');

    await Booking.create({
      user: customer1._id, hotel: hotel1._id, room: rooms[0]._id,
      checkIn: futureDate1, checkOut: futureDate2,
      guests: { adults: 2, children: 0 }, unitsBooked: 1,
      totalPrice: 18999 * 5, status: 'confirmed', paymentStatus: 'paid',
      paymentMethod: 'upi'
    });

    await Booking.create({
      user: customer2._id, hotel: hotel3._id, room: rooms[5]._id,
      checkIn: futureDate3, checkOut: futureDate4,
      guests: { adults: 2, children: 1 }, unitsBooked: 1,
      totalPrice: 35999 * 4, status: 'confirmed', paymentStatus: 'paid',
      paymentMethod: 'credit-card'
    });

    await Booking.create({
      user: customer1._id, hotel: hotel2._id, room: rooms[4]._id,
      checkIn: new Date('2026-02-10'), checkOut: new Date('2026-02-14'),
      guests: { adults: 2, children: 0 }, unitsBooked: 1,
      totalPrice: 7999 * 4, status: 'checked-out', paymentStatus: 'paid',
      paymentMethod: 'upi'
    });

    console.log('Bookings created');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login credentials:');
    console.log('  Admin:    admin@ecostay.com / admin123');
    console.log('  Owner 1:  priya@ecostay.com / owner123');
    console.log('  Owner 2:  arjun@ecostay.com / owner123');
    console.log('  Customer: ananya@example.com / customer123');
    console.log('  Customer: rohan@example.com / customer123\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDB();
