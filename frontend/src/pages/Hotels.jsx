import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import HotelCard from '../components/HotelCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { hotelsAPI } from '../services/api';

const Hotels = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pages: 1, total: 0 });
  const [searchText, setSearchText] = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState('sustainability');

  const categories = [
    { value: '', label: 'All' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'boutique', label: 'Boutique' },
    { value: 'eco-lodge', label: 'Eco Lodge' },
    { value: 'resort', label: 'Resort' },
    { value: 'budget', label: 'Budget' },
    { value: 'villa', label: 'Villa' },
    { value: 'hostel', label: 'Hostel' }
  ];

  useEffect(() => {
    loadHotels();
  }, [activeCategory, sortBy, searchParams.get('search')]);

  const loadHotels = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        sort: sortBy,
        search: searchParams.get('search') || searchText,
      };
      if (activeCategory) params.category = activeCategory;

      const { data } = await hotelsAPI.getAll(params);
      setHotels(data.hotels);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchText) params.set('search', searchText);
    else params.delete('search');
    setSearchParams(params);
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    const params = new URLSearchParams(searchParams);
    if (cat) params.set('category', cat);
    else params.delete('category');
    setSearchParams(params);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.4, delay: i * 0.05 }
    })
  };

  return (
    <div className="hotels-page">
      <div className="container">
        <motion.div
          className="hotels-page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Explore Eco Hotels</h1>
          <p>Discover {pagination.total || 'amazing'} verified sustainable stays around the world</p>
        </motion.div>

        <div className="search-filter-bar">
          <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: '12px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search by name, city, or country..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ maxWidth: '400px', borderRadius: '50px', paddingLeft: '44px', backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3e%3ccircle cx='11' cy='11' r='8'/%3e%3cline x1='21' y1='21' x2='16.65' y2='16.65'/%3e%3c/svg%3e\")", backgroundRepeat: 'no-repeat', backgroundPosition: '16px center' }}
            />
            <button type="submit" className="btn btn-primary">
              <Search size={18} /> Search
            </button>
          </form>

          <select
            className="form-input form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ maxWidth: '200px', borderRadius: '50px' }}
          >
            <option value="sustainability">Top Eco Score</option>
            <option value="rating">Top Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        <div className="hotels-filters">
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={`filter-chip ${activeCategory === cat.value ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner text="Finding the best eco hotels..." />
        ) : hotels.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No hotels found</h3>
            <p>Try adjusting your search or filters to find what you're looking for.</p>
            <button className="btn btn-outline" onClick={() => { setSearchText(''); setActiveCategory(''); setSearchParams({}); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="hotels-grid">
              {hotels.map((hotel, i) => (
                <motion.div
                  key={hotel._id}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  custom={i}
                >
                  <HotelCard hotel={hotel} />
                </motion.div>
              ))}
            </div>

            {pagination.pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`pagination-btn ${page === pagination.current ? 'active' : ''}`}
                    onClick={() => loadHotels(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Hotels;
