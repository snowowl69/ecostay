import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, CreditCard, Ticket } from 'lucide-react';

const BookingCard = ({ booking, onCancel, showActions = true }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const statusClass = {
    confirmed: 'status-confirmed',
    pending: 'status-pending',
    cancelled: 'status-cancelled',
    'checked-in': 'status-checked-in',
    'checked-out': 'status-checked-out',
    refunded: 'status-cancelled'
  };

  return (
    <div className="booking-card">
      <div className="booking-card-image">
        <img
          src={booking.hotel?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
          alt={booking.hotel?.name}
        />
      </div>

      <div className="booking-card-info">
        <h4>{booking.hotel?.name || 'Hotel'}</h4>
        <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={14} />
          {booking.hotel?.address?.city}, {booking.hotel?.address?.country}
        </p>
        <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={14} />
          {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
        </p>
        <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <CreditCard size={14} />
          ₹{booking.totalPrice?.toLocaleString('en-IN')} · {booking.room?.name || booking.room?.type}
        </p>
        {booking.ticketNumber && (
          <span className="ticket-number">
            <Ticket size={12} style={{ marginRight: '4px' }} />
            {booking.ticketNumber}
          </span>
        )}
      </div>

      <div className="booking-card-actions">
        <span className={`booking-status ${statusClass[booking.status] || 'status-pending'}`}>
          {booking.status}
        </span>

        {showActions && onCancel && ['confirmed', 'pending'].includes(booking.status) && (
          <button
            className="btn btn-sm btn-outline"
            style={{ borderColor: '#ef4444', color: '#ef4444', fontSize: '0.8rem' }}
            onClick={() => onCancel(booking._id)}
          >
            Cancel
          </button>
        )}

        <Link to={`/booking-confirmation/${booking._id}`} className="btn btn-sm btn-ghost">
          View Details
        </Link>
      </div>
    </div>
  );
};

export default BookingCard;
