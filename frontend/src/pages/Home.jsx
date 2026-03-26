import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Leaf, Shield, Zap, Globe, Heart, Award, MapPin,
  TreePine, Sun, Droplets, Recycle, Car, Sprout, BatteryCharging, Utensils
} from 'lucide-react';
import SearchBar from '../components/SearchBar';
import HotelCard from '../components/HotelCard';
import { hotelsAPI } from '../services/api';

const Home = () => {
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedHotels();
  }, []);

  const loadFeaturedHotels = async () => {
    try {
      const { data } = await hotelsAPI.getAll({ limit: 6, sort: 'sustainability' });
      setFeaturedHotels(data.hotels);
    } catch (error) {
      console.error('Error loading hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const particles = useMemo(() => {
    const icons = ['🍃', '🌿', '🌱', '🍂', '✨', '🌸', '🦋'];
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      icon: icons[i % icons.length],
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 15,
      duration: 12 + Math.random() * 10,
      size: 0.8 + Math.random() * 0.6
    }));
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }
    })
  };

  return (
    <div>
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg-pattern" />
        <div className="hero-particles">
          {particles.map(p => (
            <div
              key={p.id}
              className="particle"
              style={{
                left: p.left,
                fontSize: `${p.size}rem`,
                animationDelay: `${p.delay}s`,
                animationDuration: `${p.duration}s`
              }}
            >
              {p.icon}
            </div>
          ))}
        </div>

        <div className="hero-content">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <div className="hero-badge">
              <Leaf size={14} /> #1 Sustainable Travel Platform
            </div>
          </motion.div>

          <motion.h1 className="hero-title" initial="hidden" animate="visible" variants={fadeUp} custom={1}>
            Travel Green.<br />
            Stay <span className="highlight">Extraordinary</span>.
          </motion.h1>

          <motion.p className="hero-subtitle" initial="hidden" animate="visible" variants={fadeUp} custom={2}>
            Discover eco-certified hotels that combine luxury with sustainability.
            Every stay plants a tree and supports local communities across India.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <SearchBar variant="hero" />
          </motion.div>

          <motion.div className="hero-stats" initial="hidden" animate="visible" variants={fadeUp} custom={4}>
            <div className="hero-stat">
              <div className="hero-stat-number">2,500+</div>
              <div className="hero-stat-label">Eco Hotels</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">50K+</div>
              <div className="hero-stat-label">Happy Guests</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">120+</div>
              <div className="hero-stat-label">Cities</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">1M+</div>
              <div className="hero-stat-label">Trees Planted</div>
            </div>
          </motion.div>
        </div>

        <div className="hero-scroll-indicator">
          <span>Scroll</span>
          <div className="scroll-line" />
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="features-section">
        <div className="section-header">
          <motion.div className="section-tag" initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }}>
            <Zap size={14} /> Why EcoStay
          </motion.div>
          <motion.h2 className="section-title" initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }} custom={1}>
            Redefining Sustainable Travel
          </motion.h2>
          <motion.p className="section-subtitle" initial="hidden" whileInView="visible" variants={fadeUp} viewport={{ once: true }} custom={2}>
            We believe luxury and sustainability go hand in hand. Every feature is designed
            to make eco-conscious travel effortless and enjoyable.
          </motion.p>
        </div>

        <div className="features-grid">
          {[
            { icon: <Shield size={28} />, iconClass: 'green', title: 'Verified Eco Hotels', desc: 'Every hotel is rigorously verified for genuine sustainability practices. No greenwashing — just real impact.' },
            { icon: <Zap size={28} />, iconClass: 'amber', title: 'Real-Time Availability', desc: 'Check room availability in real-time with dynamic pricing. Book instantly with zero hidden fees.' },
            { icon: <Globe size={28} />, iconClass: 'blue', title: 'Carbon Offset Included', desc: 'Every booking automatically contributes to carbon offset programs. Travel guilt-free, anywhere in the world.' },
            { icon: <Heart size={28} />, iconClass: 'rose', title: 'Community Impact', desc: 'Your stay supports local communities, from artisan partnerships to educational scholarships.' },
            { icon: <Award size={28} />, iconClass: 'purple', title: 'Sustainability Score', desc: 'Every hotel receives a transparent sustainability score based on 8 key environmental factors.' },
            { icon: <TreePine size={28} />, iconClass: 'teal', title: 'One Stay, One Tree', desc: 'For every night booked, we plant a tree in partnership with global reforestation organizations.' }
          ].map((feature, i) => (
            <motion.div
              key={i}
              className="feature-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
            >
              <div className={`feature-icon ${feature.iconClass}`}>{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== FEATURED HOTELS ===== */}
      <section className="section" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="section-header">
            <div className="section-tag"><MapPin size={14} /> Featured</div>
            <h2 className="section-title">Top Rated Eco Hotels</h2>
            <p className="section-subtitle">
              Hand-picked sustainable stays loved by conscious travelers worldwide.
            </p>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <p className="loading-text">Loading stunning eco hotels...</p>
            </div>
          ) : (
            <div className="hotels-grid">
              {featuredHotels.map((hotel, i) => (
                <motion.div
                  key={hotel._id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i}
                >
                  <HotelCard hotel={hotel} />
                </motion.div>
              ))}
            </div>
          )}

          <div className="text-center" style={{ marginTop: '48px' }}>
            <Link to="/hotels" className="btn btn-primary btn-lg">
              Explore All Hotels →
            </Link>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="how-it-works">
        <div className="section-header">
          <div className="section-tag"><Search size={14} /> Simple Process</div>
          <h2 className="section-title">Book in 3 Easy Steps</h2>
          <p className="section-subtitle">From discovery to check-in, we've made sustainable travel seamless.</p>
        </div>

        <div className="steps-grid">
          {[
            { num: 1, title: 'Search & Discover', desc: 'Browse thousands of verified eco-hotels. Filter by sustainability score, location, amenities, and price.' },
            { num: 2, title: 'Book Instantly', desc: 'Select your dates, choose your room, and book in seconds. Real-time availability ensures no surprises.' },
            { num: 3, title: 'Stay & Impact', desc: 'Enjoy your sustainable stay. Every booking plants a tree and offsets your carbon footprint automatically.' }
          ].map((step, i) => (
            <motion.div
              key={i}
              className="step-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
            >
              <div className="step-number">{step.num}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== SUSTAINABILITY ===== */}
      <section className="sustainability-section">
        <div className="sustainability-content">
          <motion.div className="sustainability-text" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2>Our Commitment to the Planet</h2>
            <p>
              We hold every partner hotel to the highest environmental standards.
              Our 8-point sustainability scoring system ensures transparency and genuine eco practices.
            </p>

            <div className="sustainability-features">
              {[
                { icon: <Sun size={18} />, label: 'Solar Powered' },
                { icon: <Droplets size={18} />, label: 'Rainwater Harvesting' },
                { icon: <Utensils size={18} />, label: 'Organic Food' },
                { icon: <Recycle size={18} />, label: 'Waste Recycling' },
                { icon: <Car size={18} />, label: 'EV Charging' },
                { icon: <Globe size={18} />, label: 'Carbon Offset' },
                { icon: <Sprout size={18} />, label: 'Local Sourcing' },
                { icon: <BatteryCharging size={18} />, label: 'Energy Efficient' }
              ].map((f, i) => (
                <div key={i} className="eco-feature">
                  {f.icon} {f.label}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="sustainability-visual" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
            <div className="eco-score-ring">
              <div className="eco-score-value">100%</div>
              <div className="eco-score-label">Eco Score</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '8px' }}>
                Our highest rated hotels
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="testimonials-section">
        <div className="section-header">
          <div className="section-tag"><Heart size={14} /> Testimonials</div>
          <h2 className="section-title">Loved by Travelers</h2>
          <p className="section-subtitle">See what our conscious travelers have to say about their eco stays.</p>
        </div>

        <div className="testimonials-grid">
          {[
            { name: 'Sarah Chen', role: 'Travel Blogger', text: "EcoStay has transformed how I travel. Knowing each booking plants a tree makes every trip feel meaningful. The hotels are genuinely beautiful.", initials: 'SC' },
            { name: 'Marcus Rivera', role: 'Business Traveler', text: "I was skeptical about eco-hotels being luxurious, but EcoStay proved me wrong. The Green Haven Resort was the best hotel experience I've had.", initials: 'MR' },
            { name: 'Priya Patel', role: 'Solo Adventurer', text: "The sustainability scores are so transparent! I love being able to see exactly what makes each hotel eco-friendly. No greenwashing at all.", initials: 'PP' }
          ].map((t, i) => (
            <motion.div
              key={i}
              className="testimonial-card"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
            >
              <div className="testimonial-stars">★★★★★</div>
              <p className="testimonial-text">"{t.text}"</p>
              <div className="testimonial-author">
                <div className="testimonial-avatar">{t.initials}</div>
                <div>
                  <div className="testimonial-author-name">{t.name}</div>
                  <div className="testimonial-author-role">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section">
        <div className="cta-content">
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            Ready to Travel Sustainably?
          </motion.h2>
          <motion.p initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
            Join thousands of conscious travelers who choose to make a positive
            impact with every trip. Your next adventure starts here.
          </motion.p>
          <motion.div className="cta-buttons" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
            <Link to="/register" className="btn btn-primary btn-lg">
              🌿 Create Free Account
            </Link>
            <Link to="/hotels" className="btn btn-outline btn-lg">
              Browse Hotels
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
