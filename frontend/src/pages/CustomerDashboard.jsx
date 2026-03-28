import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, MapPin, Clock, Ticket, TrendingUp, Leaf,
  ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BookingCard from '../components/BookingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { bookingsAPI } from '../services/api';
import toast from 'react-hot-toast';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const { data } = await bookingsAPI.getMyBookings();
      setBookings(data.bookings);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(bookingId);
    try {
      await bookingsAPI.cancel(bookingId);
      toast.success('Booking cancelled');
      loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel');
    } finally {
      setCancellingId(null);
    }
  };

  const now = new Date();
  const upcoming = bookings.filter(b => new Date(b.checkIn) >= now && b.status !== 'cancelled');
  const past = bookings.filter(b => new Date(b.checkOut) < now || b.status === 'checked-out');
  const cancelled = bookings.filter(b => b.status === 'cancelled');
  const totalSpent = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.totalPrice || 0), 0);
  const carbonSaved = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.carbonOffset?.amount || 0), 0);

  const tabs = [
    { key: 'upcoming', label: `Upcoming (${upcoming.length})` },
    { key: 'past', label: `Past (${past.length})` },
    { key: 'cancelled', label: `Cancelled (${cancelled.length})` },
  ];

  const currentBookings = activeTab === 'upcoming' ? upcoming : activeTab === 'past' ? past : cancelled;

  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="dashboard-page">
      <div className="container">
        <motion.div className="dashboard-header" initial="hidden" animate="visible" variants={fadeUp} transition={{ duration: 0.5 }}>
          <div>
            <h1>Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
            <p>Manage your eco-friendly travels and bookings here.</p>
          </div>
        </motion.div>

        <div className="dashboard-stats">
          <motion.div className="stat-card" variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
            <div className="stat-icon" style={{ background: 'var(--gradient-primary)' }}>
              <Ticket size={24} />
            </div>
            <div>
              <span className="stat-value">{bookings.length}</span>
              <span className="stat-label">Total Bookings</span>
            </div>
          </motion.div>
          <motion.div className="stat-card" variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
              <Calendar size={24} />
            </div>
            <div>
              <span className="stat-value">{upcoming.length}</span>
              <span className="stat-label">Upcoming</span>
            </div>
          </motion.div>
          <motion.div className="stat-card" variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <span className="stat-value">₹{totalSpent.toLocaleString('en-IN')}</span>
              <span className="stat-label">Total Spent</span>
            </div>
          </motion.div>
          <motion.div className="stat-card" variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.25 }}>
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <Leaf size={24} />
            </div>
            <div>
              <span className="stat-value">{carbonSaved.toFixed(1)}kg</span>
              <span className="stat-label">CO₂ Offset</span>
            </div>
          </motion.div>
        </div>

        <div className="dashboard-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`dashboard-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner text="Loading your bookings..." />
        ) : currentBookings.length === 0 ? (
          <motion.div className="empty-state" initial="hidden" animate="visible" variants={fadeUp}>
            <div className="empty-state-icon">
              {activeTab === 'upcoming' ? '🌿' : activeTab === 'past' ? '📖' : '❌'}
            </div>
            <h3>No {activeTab} bookings</h3>
            <p>{activeTab === 'upcoming' ? 'Start planning your next eco-friendly adventure!' : `You have no ${activeTab} bookings.`}</p>
            {activeTab === 'upcoming' && (
              <a href="/hotels" className="btn btn-primary">Explore Hotels</a>
            )}
          </motion.div>
        ) : (
          <div className="bookings-list">
            {currentBookings.map((booking, i) => (
              <motion.div key={booking._id} initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: i * 0.05 }}>
                <BookingCard
                  booking={booking}
                  onCancel={() => handleCancel(booking._id)}
                  cancelling={cancellingId === booking._id}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
