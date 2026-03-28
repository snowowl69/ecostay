import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, Calendar, MapPin, Users, Ticket, Download,
  Home, Leaf, Clock, CreditCard
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { bookingsAPI } from '../services/api';

const BookingConfirmation = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooking();
  }, [id]);

  const loadBooking = async () => {
    try {
      const { data } = await bookingsAPI.getById(id);
      setBooking(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading booking details..." />;
  if (!booking) return (
    <div className="empty-state" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div>
        <div className="empty-state-icon">❓</div>
        <h3>Booking Not Found</h3>
        <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
      </div>
    </div>
  );

  const nights = Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24));

  return (
    <div className="booking-confirmation-page">
      <div className="container" style={{ maxWidth: '700px' }}>
        <motion.div
          className="confirmation-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="confirmation-header">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            >
              <CheckCircle size={64} strokeWidth={1.5} style={{ color: 'var(--color-primary)' }} />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Booking Confirmed!
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              style={{ color: 'var(--color-text-muted)' }}
            >
              Your eco-friendly stay has been booked successfully.
            </motion.p>
          </div>

          <motion.div
            className="ticket-display"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Ticket size={20} />
            <div>
              <span className="ticket-label">Booking Ticket</span>
              <span className="ticket-number">{booking.ticketNumber}</span>
            </div>
          </motion.div>

          <motion.div
            className="confirmation-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3>Booking Details</h3>

            <div className="detail-row">
              <div className="detail-icon"><Home size={18} /></div>
              <div>
                <span className="detail-label">Hotel</span>
                <span className="detail-value">{booking.hotel?.name || 'Hotel'}</span>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-icon"><MapPin size={18} /></div>
              <div>
                <span className="detail-label">Location</span>
                <span className="detail-value">{booking.hotel?.address?.city}, {booking.hotel?.address?.country}</span>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-icon"><Calendar size={18} /></div>
              <div>
                <span className="detail-label">Check-in</span>
                <span className="detail-value">{new Date(booking.checkIn).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-icon"><Calendar size={18} /></div>
              <div>
                <span className="detail-label">Check-out</span>
                <span className="detail-value">{new Date(booking.checkOut).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-icon"><Clock size={18} /></div>
              <div>
                <span className="detail-label">Duration</span>
                <span className="detail-value">{nights} night{nights > 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="detail-row">
              <div className="detail-icon"><Users size={18} /></div>
              <div>
                <span className="detail-label">Guests</span>
                <span className="detail-value">{(booking.guests?.adults || 0) + (booking.guests?.children || 0)} guest{((booking.guests?.adults || 0) + (booking.guests?.children || 0)) > 1 ? 's' : ''} • {booking.units || 1} room{(booking.units || 1) > 1 ? 's' : ''}</span>
              </div>
            </div>

            {booking.room && (
              <div className="detail-row">
                <div className="detail-icon"><Home size={18} /></div>
                <div>
                  <span className="detail-label">Room</span>
                  <span className="detail-value">{booking.room.name} ({booking.room.type})</span>
                </div>
              </div>
            )}

            <div className="detail-row total-row">
              <div className="detail-icon"><CreditCard size={18} /></div>
              <div>
                <span className="detail-label">Total Amount</span>
                <span className="detail-value" style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-primary)' }}>₹{booking.totalPrice?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </motion.div>

          {booking.carbonOffset > 0 && (
            <motion.div
              className="eco-impact-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Leaf size={20} />
              <div>
                <strong>Eco Impact</strong>
                <p>This booking offsets {booking.carbonOffset.toFixed(1)}kg of CO₂ — equivalent to planting {Math.ceil(booking.carbonOffset / 20)} tree{Math.ceil(booking.carbonOffset / 20) > 1 ? 's' : ''}!</p>
              </div>
            </motion.div>
          )}

          <motion.div
            className="confirmation-actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Link to="/dashboard" className="btn btn-primary">
              <Calendar size={18} /> View My Bookings
            </Link>
            <Link to="/hotels" className="btn btn-outline">
              Explore More Hotels
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
