import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar } from 'lucide-react';

const SearchBar = ({ variant = 'hero' }) => {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set('search', destination);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    navigate(`/hotels?${params.toString()}`);
  };

  if (variant === 'hero') {
    return (
      <form className="hero-search" onSubmit={handleSearch}>
        <div className="hero-search-input">
          <label>Destination</label>
          <input
            type="text"
            placeholder="Where are you going?"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
        <div className="hero-search-divider" />
        <div className="hero-search-input">
          <label>Check In</label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            style={{ colorScheme: 'dark' }}
          />
        </div>
        <div className="hero-search-divider" />
        <div className="hero-search-input">
          <label>Check Out</label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || new Date().toISOString().split('T')[0]}
            style={{ colorScheme: 'dark' }}
          />
        </div>
        <button type="submit" className="hero-search-btn">
          <Search size={18} />
          Search
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <input
        type="text"
        className="form-input"
        placeholder="Search destination..."
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
        style={{ maxWidth: '300px', borderRadius: '50px', paddingLeft: '20px' }}
      />
      <input
        type="date"
        className="form-input"
        value={checkIn}
        onChange={(e) => setCheckIn(e.target.value)}
        style={{ maxWidth: '180px', borderRadius: '50px' }}
      />
      <input
        type="date"
        className="form-input"
        value={checkOut}
        onChange={(e) => setCheckOut(e.target.value)}
        style={{ maxWidth: '180px', borderRadius: '50px' }}
      />
      <button type="submit" className="btn btn-primary">
        <Search size={18} /> Search
      </button>
    </form>
  );
};

export default SearchBar;
