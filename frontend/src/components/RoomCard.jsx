import React from 'react';
import { Users, Maximize, Leaf } from 'lucide-react';

const RoomCard = ({ room, onBook, checkIn, checkOut }) => {
  const ecoFeatureLabels = {
    bambooFurniture: '🎋 Bamboo',
    organicLinens: '🌱 Organic Linens',
    lowFlowFixtures: '💧 Low-Flow',
    ledLighting: '💡 LED',
    recycledMaterials: '♻️ Recycled'
  };

  const activeEcoFeatures = Object.entries(room.ecoFeatures || {})
    .filter(([_, v]) => v)
    .map(([k]) => ecoFeatureLabels[k] || k);

  return (
    <div className="room-card">
      <div className="room-card-image">
        <img
          src={room.images?.[0] || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800'}
          alt={room.name}
          loading="lazy"
        />
      </div>

      <div className="room-card-info">
        <h4>{room.name}</h4>
        <p className="room-type">{room.type?.replace('-', ' ')}</p>
        
        <div style={{ display: 'flex', gap: '16px', marginBottom: '10px', fontSize: '0.85rem', color: '#64748b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Users size={14} /> {room.capacity?.adults} Adults, {room.capacity?.children} Children
          </span>
          {room.floorArea > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Maximize size={14} /> {room.floorArea} m²
            </span>
          )}
        </div>

        {room.description && (
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '10px', lineHeight: '1.6' }}>
            {room.description}
          </p>
        )}

        <div className="room-card-amenities" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {room.amenities?.slice(0, 4).map((a, i) => (
            <span key={i} className="amenity-tag">{a}</span>
          ))}
        </div>

        {activeEcoFeatures.length > 0 && (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
            {activeEcoFeatures.map((f, i) => (
              <span key={i} style={{
                padding: '3px 8px',
                background: '#ecfdf5',
                color: '#059669',
                borderRadius: '20px',
                fontSize: '0.7rem',
                fontWeight: 600
              }}>
                {f}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="room-card-pricing">
        <div className="room-price">₹{room.price?.base?.toLocaleString('en-IN')}</div>
        <div className="room-price-label">per night</div>

        {room.isAvailable !== undefined && (
          <div className={`room-availability ${room.isAvailable ? 'available' : 'unavailable'}`}>
            {room.isAvailable ? `${room.availableUnits} available` : 'Unavailable'}
          </div>
        )}

        {onBook && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onBook(room)}
            disabled={room.isAvailable === false}
          >
            Book Now
          </button>
        )}
      </div>
    </div>
  );
};

export default RoomCard;
