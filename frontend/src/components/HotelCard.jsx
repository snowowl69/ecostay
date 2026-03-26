import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Heart, Leaf } from 'lucide-react';

const HotelCard = ({ hotel }) => {
  const getStars = (rating) => {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  };

  return (
    <div className="hotel-card">
      <div className="hotel-card-image">
        <img
          src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'}
          alt={hotel.name}
          loading="lazy"
        />
        <div className="hotel-card-badges">
          {hotel.sustainability?.certified && (
            <span className="hotel-badge hotel-badge-eco">
              <Leaf size={12} /> Eco Certified
            </span>
          )}
          <span className="hotel-badge hotel-badge-category">
            {hotel.category?.replace('-', ' ')}
          </span>
        </div>
        <button className="hotel-card-favorite" aria-label="Save hotel">
          <Heart size={18} />
        </button>
      </div>

      <div className="hotel-card-body">
        <div className="hotel-card-location">
          <MapPin size={14} />
          {hotel.address?.city}, {hotel.address?.country}
        </div>
        
        <Link to={`/hotels/${hotel._id}`}>
          <h3 className="hotel-card-name">{hotel.name}</h3>
        </Link>
        
        <p className="hotel-card-desc">{hotel.description}</p>

        <div className="hotel-card-amenities">
          {hotel.amenities?.slice(0, 4).map((amenity, i) => (
            <span key={i} className="amenity-tag">{amenity}</span>
          ))}
          {hotel.amenities?.length > 4 && (
            <span className="amenity-tag">+{hotel.amenities.length - 4}</span>
          )}
        </div>

        <div className="hotel-card-footer">
          <div className="hotel-card-rating">
            <span className="rating-stars">{getStars(hotel.rating?.average || 0)}</span>
            <span className="rating-value">{hotel.rating?.average || 'New'}</span>
            <span className="rating-count">({hotel.rating?.count || 0})</span>
          </div>
          <div className="hotel-card-price">
            <div className="price-label">from</div>
            <div className="price-amount">₹{hotel.minPrice || '4,999'}</div>
            <div className="price-label">/night</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
