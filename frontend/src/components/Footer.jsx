import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Leaf size={24} style={{ color: '#10b981' }} />
            EcoStay
          </h3>
          <p>
            Discover sustainable hospitality that doesn't compromise on luxury.
            Every booking plants a tree and supports local communities.
          </p>
          <div className="footer-social">
            <a href="#" aria-label="Twitter">𝕏</a>
            <a href="#" aria-label="Instagram">📷</a>
            <a href="#" aria-label="LinkedIn">in</a>
            <a href="#" aria-label="Facebook">f</a>
          </div>
        </div>

        <div className="footer-column">
          <h4>Explore</h4>
          <Link to="/hotels">All Hotels</Link>
          <Link to="/hotels?category=eco-lodge">Eco Lodges</Link>
          <Link to="/hotels?category=resort">Resorts</Link>
          <Link to="/hotels?category=boutique">Boutique</Link>
          <Link to="/hotels?category=villa">Villas</Link>
        </div>

        <div className="footer-column">
          <h4>Company</h4>
          <a href="#">About Us</a>
          <a href="#">Our Mission</a>
          <a href="#">Sustainability</a>
          <a href="#">Careers</a>
          <a href="#">Press</a>
        </div>

        <div className="footer-column">
          <h4>Support</h4>
          <a href="#">Help Center</a>
          <a href="#">Cancellation</a>
          <a href="#">Safety</a>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 EcoStay. All rights reserved.</span>
        <span>🌿 Every booking plants a tree</span>
      </div>
    </footer>
  );
};

export default Footer;
