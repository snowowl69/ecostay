import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Star, Wifi, Car, Waves, Utensils, Dumbbell, Shield,
  Leaf, Sun, Droplets, Recycle, Zap, Heart, ChevronLeft, ChevronRight,
  Calendar, Users, Minus, Plus, X, Check, Award, Phone, Mail,
  Clock, Maximize, Filter, ThumbsUp, Coffee, Wind, TreePine, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RoomCard from '../components/RoomCard';
import SustainabilityBadge from '../components/SustainabilityBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { hotelsAPI, bookingsAPI } from '../services/api';
import toast from 'react-hot-toast';

const amenityIcons = {
  wifi: <Wifi size={18} />, parking: <Car size={18} />,
  pool: <Waves size={18} />, restaurant: <Utensils size={18} />,
  gym: <Dumbbell size={18} />, spa: <Waves size={18} />,
  'room-service': <Coffee size={18} />, security: <Shield size={18} />,
  'air-conditioning': <Wind size={18} />, laundry: <Sparkles size={18} />,
  garden: <TreePine size={18} />
};

const amenityLabels = {
  wifi: 'Free WiFi', parking: 'Free Parking', pool: 'Swimming Pool',
  restaurant: 'Restaurant', gym: 'Fitness Center', spa: 'Spa & Wellness',
  'room-service': 'Room Service', security: '24/7 Security',
  'air-conditioning': 'Air Conditioning', laundry: 'Laundry Service',
  garden: 'Garden'
};

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingData, setBookingData] = useState({
    checkIn: '', checkOut: '', guests: 1, units: 1, specialRequests: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [filterRating, setFilterRating] = useState(0);

  useEffect(() => { loadHotel(); }, [id]);

  const loadHotel = async () => {
    setLoading(true);
    try {
      const res = await hotelsAPI.getById(id);
      setHotel(res.data.hotel);
      const roomsData = res.data.rooms;
      setRooms(Array.isArray(roomsData) ? roomsData : []);
    } catch (err) {
      toast.error('Hotel not found');
      navigate('/hotels');
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = useMemo(() => {
    const reviews = hotel?.reviews || [];
    if (filterRating === 0) return reviews;
    return reviews.filter(r => r.rating === filterRating);
  }, [hotel?.reviews, filterRating]);

  const ratingDistribution = useMemo(() => {
    const reviews = hotel?.reviews || [];
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => { if (dist[r.rating] !== undefined) dist[r.rating]++; });
    return dist;
  }, [hotel?.reviews]);

  const handleBookRoom = (room) => {
    if (!user) { toast.error('Please login to book'); navigate('/login'); return; }
    setSelectedRoom(room);
    setShowBooking(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!bookingData.checkIn || !bookingData.checkOut) {
      toast.error('Please select check-in and check-out dates'); return;
    }
    if (new Date(bookingData.checkIn) >= new Date(bookingData.checkOut)) {
      toast.error('Check-out must be after check-in'); return;
    }
    setBookingLoading(true);
    try {
      const res = await bookingsAPI.create({
        hotel: hotel._id,
        room: selectedRoom._id,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        guests: { adults: bookingData.guests, children: 0 },
        unitsBooked: bookingData.units,
        specialRequests: bookingData.specialRequests
      });
      toast.success('Booking confirmed! 🎉');
      navigate(`/booking-confirmation/${res.data._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    setSubmittingReview(true);
    try {
      await hotelsAPI.addReview(hotel._id, { rating: reviewRating, comment: reviewText });
      toast.success('Review added!');
      setReviewText('');
      setReviewRating(5);
      loadHotel();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not add review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    return Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24));
  };

  const placeholderImages = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'
  ];

  if (loading) return <LoadingSpinner text="Loading hotel details..." />;
  if (!hotel) return null;

  const images = hotel.images?.length ? hotel.images : placeholderImages;
  const susScore = hotel.sustainability?.score || 0;
  const totalReviews = hotel.reviews?.length || 0;
  const avgRating = hotel.rating?.average || 0;
  const lowestPrice = rooms.length > 0 ? Math.min(...rooms.map(r => r.price?.base ?? r.price ?? 0)) : 0;

  const sustainabilityFeatures = [];
  if (hotel.sustainability?.solarPowered) sustainabilityFeatures.push({ icon: <Sun size={16} />, label: 'Solar Powered' });
  if (hotel.sustainability?.rainwaterHarvesting) sustainabilityFeatures.push({ icon: <Droplets size={16} />, label: 'Rainwater Harvesting' });
  if (hotel.sustainability?.organicFood) sustainabilityFeatures.push({ icon: <Leaf size={16} />, label: 'Organic Food' });
  if (hotel.sustainability?.wasteRecycling) sustainabilityFeatures.push({ icon: <Recycle size={16} />, label: 'Waste Recycling' });
  if (hotel.sustainability?.electricVehicleCharging) sustainabilityFeatures.push({ icon: <Zap size={16} />, label: 'EV Charging' });
  if (hotel.sustainability?.carbonOffset) sustainabilityFeatures.push({ icon: <Award size={16} />, label: 'Carbon Offset' });
  if (hotel.sustainability?.localSourcing) sustainabilityFeatures.push({ icon: <Heart size={16} />, label: 'Local Sourcing' });
  if (hotel.sustainability?.energyEfficient) sustainabilityFeatures.push({ icon: <Zap size={16} />, label: 'Energy Efficient' });

  return (
    <div className="hotel-detail-page">
      <div className="hotel-detail-hero">
        <div className="hotel-gallery">
          <motion.img
            key={activeImage}
            src={images[activeImage]}
            alt={hotel.name}
            className="gallery-main-image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            onError={(e) => { e.target.src = placeholderImages[0]; }}
          />
          {images.length > 1 && (
            <>
              <button className="gallery-nav prev" onClick={() => setActiveImage((p) => (p - 1 + images.length) % images.length)}>
                <ChevronLeft size={24} />
              </button>
              <button className="gallery-nav next" onClick={() => setActiveImage((p) => (p + 1) % images.length)}>
                <ChevronRight size={24} />
              </button>
            </>
          )}
          <div className="gallery-dots">
            {images.map((_, i) => (
              <button key={i} className={`gallery-dot ${i === activeImage ? 'active' : ''}`} onClick={() => setActiveImage(i)} />
            ))}
          </div>
          <div className="gallery-thumbnails">
            {images.slice(0, 5).map((img, i) => (
              <button key={i} className={`gallery-thumb ${i === activeImage ? 'active' : ''}`} onClick={() => setActiveImage(i)}>
                <img src={img} alt="" onError={(e) => { e.target.src = placeholderImages[0]; }} />
              </button>
            ))}
          </div>
          {hotel.sustainability?.certified && (
            <div className="gallery-eco-badge"><Leaf size={16} /> Eco Certified</div>
          )}
          {hotel.category && (
            <div className="gallery-category-badge">{hotel.category}</div>
          )}
        </div>
      </div>

      <div className="hotel-quick-info-bar">
        <div className="container">
          <div className="quick-info-inner">
            <div className="quick-info-left">
              <h1>{hotel.name}</h1>
              <div className="quick-info-meta">
                <span><MapPin size={15} /> {hotel.address?.city}, {hotel.address?.state}</span>
                <span className="quick-info-divider">|</span>
                <span className="quick-info-rating">
                  <Star size={15} fill="var(--color-warning)" stroke="var(--color-warning)" />
                  {avgRating > 0 ? avgRating.toFixed(1) : 'New'} ({totalReviews} reviews)
                </span>
                {hotel.isVerified && (
                  <>
                    <span className="quick-info-divider">|</span>
                    <span className="verified-badge"><Check size={14} /> Verified</span>
                  </>
                )}
              </div>
            </div>
            <div className="quick-info-right">
              {lowestPrice > 0 && (
                <div className="quick-info-price">
                  <span className="price-from">From</span>
                  <span className="price-amount">₹{lowestPrice.toLocaleString('en-IN')}</span>
                  <span className="price-per">/ night</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="hotel-detail-content">
          <div className="hotel-detail-main">

            <motion.section className="hotel-section" variants={fadeUp} initial="hidden" animate="visible" transition={{ duration: 0.5 }}>
              <h2 className="section-heading"><Sparkles size={22} /> About This Hotel</h2>
              <p className="hotel-description-full">{hotel.description}</p>

              <div className="hotel-highlights-grid">
                <div className="highlight-card">
                  <Star size={20} />
                  <div><strong>{avgRating > 0 ? avgRating.toFixed(1) : '—'}</strong><span>Rating</span></div>
                </div>
                <div className="highlight-card">
                  <Users size={20} />
                  <div><strong>{totalReviews}</strong><span>Reviews</span></div>
                </div>
                <div className="highlight-card">
                  <Leaf size={20} />
                  <div><strong>{susScore}%</strong><span>Eco Score</span></div>
                </div>
                <div className="highlight-card">
                  <Award size={20} />
                  <div><strong>{rooms.length}</strong><span>Room Types</span></div>
                </div>
              </div>

              <div className="hotel-policies">
                <h3>Hotel Policies</h3>
                <div className="policies-grid">
                  <div className="policy-item">
                    <Clock size={18} />
                    <div><strong>Check-in</strong><span>{hotel.policies?.checkIn || '14:00'}</span></div>
                  </div>
                  <div className="policy-item">
                    <Clock size={18} />
                    <div><strong>Check-out</strong><span>{hotel.policies?.checkOut || '11:00'}</span></div>
                  </div>
                  <div className="policy-item">
                    <Calendar size={18} />
                    <div><strong>Cancellation</strong><span>{hotel.policies?.cancellation || 'Free cancellation up to 24 hours'}</span></div>
                  </div>
                  <div className="policy-item">
                    <Heart size={18} />
                    <div><strong>Pets</strong><span>{hotel.policies?.petFriendly ? 'Pet Friendly' : 'No Pets Allowed'}</span></div>
                  </div>
                </div>
              </div>

              <div className="hotel-contact-info">
                <h3>Contact</h3>
                <div className="contact-row">
                  {hotel.contactEmail && (
                    <a href={`mailto:${hotel.contactEmail}`} className="contact-item"><Mail size={16} /> {hotel.contactEmail}</a>
                  )}
                  {hotel.contactPhone && (
                    <a href={`tel:${hotel.contactPhone}`} className="contact-item"><Phone size={16} /> {hotel.contactPhone}</a>
                  )}
                  {hotel.address?.city && (
                    <span className="contact-item">
                      <MapPin size={16} /> {[hotel.address.street, hotel.address.city, hotel.address.state, hotel.address.zipCode].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </motion.section>

            <motion.section className="hotel-section" variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <h2 className="section-heading"><Check size={22} /> Amenities & Facilities</h2>
              {hotel.amenities?.length > 0 ? (
                <div className="amenities-grid-detail">
                  {hotel.amenities.map((amenity) => (
                    <div key={amenity} className="amenity-card">
                      <div className="amenity-card-icon">
                        {amenityIcons[amenity] || <Check size={18} />}
                      </div>
                      <span>{amenityLabels[amenity] || amenity.replace(/-/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--color-text-muted)' }}>No amenities listed.</p>
              )}

              {sustainabilityFeatures.length > 0 && (
                <div className="sustainability-section">
                  <h3><Leaf size={18} /> Sustainability Practices</h3>
                  <div className="sustainability-detail-grid">
                    <div className="sustainability-score-card">
                      <SustainabilityBadge score={susScore} size="md" />
                      <div className="score-label">
                        <strong>Eco Score: {susScore}%</strong>
                        {hotel.sustainability?.certified && (
                          <span className="certified-text"><Award size={14} /> Certified Eco Hotel</span>
                        )}
                      </div>
                    </div>
                    <div className="sustainability-features-grid">
                      {sustainabilityFeatures.map((feat, i) => (
                        <div key={i} className="eco-feature-tag">{feat.icon} {feat.label}</div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.section>

            <motion.section className="hotel-section" variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <h2 className="section-heading"><Award size={22} /> Available Rooms</h2>
              {rooms.length === 0 ? (
                <div className="empty-state" style={{ padding: '40px 20px' }}>
                  <p>No rooms listed for this hotel yet.</p>
                </div>
              ) : (
                <div className="rooms-list">
                  {rooms.map((room) => (
                    <RoomCard key={room._id} room={room} onBook={() => handleBookRoom(room)} />
                  ))}
                </div>
              )}
            </motion.section>

            <motion.section className="hotel-section" variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
              <h2 className="section-heading"><ThumbsUp size={22} /> Guest Reviews</h2>

              <div className="review-overview">
                <div className="review-overview-score">
                  <div className="big-score">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</div>
                  <div className="big-score-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={18} fill={i < Math.round(avgRating) ? 'var(--color-warning)' : 'none'} stroke="var(--color-warning)" />
                    ))}
                  </div>
                  <span className="big-score-count">{totalReviews} review{totalReviews !== 1 ? 's' : ''}</span>
                </div>
                <div className="review-overview-bars">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = ratingDistribution[star];
                    const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <button
                        key={star}
                        className={`rating-bar-row ${filterRating === star ? 'active' : ''}`}
                        onClick={() => setFilterRating(filterRating === star ? 0 : star)}
                      >
                        <span className="bar-label">{star} <Star size={12} fill="var(--color-warning)" stroke="var(--color-warning)" /></span>
                        <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
                        <span className="bar-count">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {filterRating > 0 && (
                <div className="review-filter-active">
                  <Filter size={14} />
                  Showing {filterRating}-star reviews ({filteredReviews.length})
                  <button onClick={() => setFilterRating(0)} className="clear-filter">Clear filter</button>
                </div>
              )}

              {user && (
                <form onSubmit={handleReviewSubmit} className="review-form">
                  <h4>Write a Review</h4>
                  <div className="review-rating-select">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button type="button" key={s} onClick={() => setReviewRating(s)} className={`star-btn ${s <= reviewRating ? 'active' : ''}`}>
                        <Star size={22} fill={s <= reviewRating ? 'var(--color-warning)' : 'none'} stroke="var(--color-warning)" />
                      </button>
                    ))}
                    <span style={{ marginLeft: '8px', fontWeight: 600, color: 'var(--color-text-muted)' }}>{reviewRating}/5</span>
                  </div>
                  <textarea
                    className="form-input form-textarea"
                    placeholder="Share your experience at this hotel..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    rows={3}
                    required
                  />
                  <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                    {submittingReview ? 'Posting...' : 'Post Review'}
                  </button>
                </form>
              )}

              <div className="reviews-list">
                {filteredReviews.length === 0 ? (
                  <div className="empty-reviews">
                    {filterRating > 0 ? `No ${filterRating}-star reviews yet.` : 'No reviews yet. Be the first to share your experience!'}
                  </div>
                ) : (
                  filteredReviews.map((review, i) => (
                    <motion.div
                      key={review._id || i}
                      className="review-card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="review-header">
                        <div className="review-avatar">{review.user?.name?.charAt(0) || 'U'}</div>
                        <div className="review-author-info">
                          <strong>{review.user?.name || 'Guest'}</strong>
                          <span className="review-date">
                            {new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="review-stars">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star key={s} size={14} fill={s < review.rating ? 'var(--color-warning)' : 'none'} stroke="var(--color-warning)" />
                          ))}
                        </div>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.section>
          </div>

          <div className="hotel-detail-sidebar">
            <motion.div className="booking-widget" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div className="booking-widget-header">
                {lowestPrice > 0 ? (
                  <>
                    <span className="booking-widget-price">₹{lowestPrice.toLocaleString('en-IN')}</span>
                    <span className="booking-widget-per">/ night</span>
                  </>
                ) : (
                  <span className="booking-widget-price">Contact for pricing</span>
                )}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
                Starting from &bull; {rooms.length} room type{rooms.length !== 1 ? 's' : ''} available
              </p>
              <button
                className="btn btn-primary btn-block"
                onClick={() => {
                  if (rooms.length > 0) handleBookRoom(rooms[0]);
                  else toast.error('No rooms available');
                }}
              >
                Book Now
              </button>
              <div className="booking-widget-features">
                <div><Check size={14} /> Free cancellation</div>
                <div><Check size={14} /> Instant confirmation</div>
                <div><Leaf size={14} /> Carbon offset included</div>
              </div>
              {susScore > 0 && (
                <div className="widget-eco-score">
                  <Leaf size={16} />
                  <div>
                    <strong>Eco Score: {susScore}%</strong>
                    <span>{susScore >= 75 ? 'Certified Eco Hotel' : susScore >= 50 ? 'Eco-Friendly' : 'Going Green'}</span>
                  </div>
                </div>
              )}
              <div className="widget-contact">
                {hotel.contactPhone && (
                  <a href={`tel:${hotel.contactPhone}`} className="widget-contact-item"><Phone size={14} /> Call Hotel</a>
                )}
                {hotel.contactEmail && (
                  <a href={`mailto:${hotel.contactEmail}`} className="widget-contact-item"><Mail size={14} /> Email Hotel</a>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showBooking && selectedRoom && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBooking(false)}>
            <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
              <div className="modal-header">
                <h2>Book Your Stay</h2>
                <button className="modal-close" onClick={() => setShowBooking(false)}><X size={24} /></button>
              </div>
              <div className="modal-body">
                <div style={{ background: 'var(--glass-bg)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '20px' }}>
                  <h4 style={{ margin: 0 }}>{selectedRoom.name}</h4>
                  <p style={{ color: 'var(--color-text-muted)', margin: '4px 0', fontSize: '0.9rem' }}>
                    {selectedRoom.type} &bull; ₹{(selectedRoom.price?.base ?? selectedRoom.price ?? 0).toLocaleString('en-IN')}/night
                  </p>
                </div>
                <form onSubmit={handleBookingSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Check-in</label>
                      <input type="date" className="form-input" value={bookingData.checkIn}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setBookingData({ ...bookingData, checkIn: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Check-out</label>
                      <input type="date" className="form-input" value={bookingData.checkOut}
                        min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                        onChange={(e) => setBookingData({ ...bookingData, checkOut: e.target.value })} required />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Guests</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button type="button" className="btn btn-outline" style={{ padding: '6px 10px' }}
                          onClick={() => setBookingData({ ...bookingData, guests: Math.max(1, bookingData.guests - 1) })}><Minus size={16} /></button>
                        <span style={{ fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{bookingData.guests}</span>
                        <button type="button" className="btn btn-outline" style={{ padding: '6px 10px' }}
                          onClick={() => setBookingData({ ...bookingData, guests: Math.min((selectedRoom.capacity?.adults || 4) + (selectedRoom.capacity?.children || 0), bookingData.guests + 1) })}><Plus size={16} /></button>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Rooms</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button type="button" className="btn btn-outline" style={{ padding: '6px 10px' }}
                          onClick={() => setBookingData({ ...bookingData, units: Math.max(1, bookingData.units - 1) })}><Minus size={16} /></button>
                        <span style={{ fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{bookingData.units}</span>
                        <button type="button" className="btn btn-outline" style={{ padding: '6px 10px' }}
                          onClick={() => setBookingData({ ...bookingData, units: bookingData.units + 1 })}><Plus size={16} /></button>
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Special Requests</label>
                    <textarea className="form-input form-textarea" placeholder="Any special requests..." rows={2}
                      value={bookingData.specialRequests} onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })} />
                  </div>

                  {calculateNights() > 0 && (() => {
                    const pricePerNight = selectedRoom.price?.base ?? selectedRoom.price ?? 0;
                    return (
                      <div style={{ background: 'var(--gradient-primary)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '16px', color: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span>₹{pricePerNight.toLocaleString('en-IN')} × {calculateNights()} nights × {bookingData.units} room(s)</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.2rem' }}>
                          <span>Total</span>
                          <span>₹{(pricePerNight * calculateNights() * bookingData.units).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    );
                  })()}

                  <button type="submit" className="btn btn-primary btn-block" disabled={bookingLoading}>
                    {bookingLoading ? 'Processing...' : 'Confirm Booking'}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HotelDetail;
