import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Users, Hotel, Calendar, IndianRupee, Shield,
  Check, X, Eye, Trash2, ChevronDown, Search, TrendingUp
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [hotels, setHotels] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, hotelsRes, usersRes, bookingsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getHotels(),
        adminAPI.getUsers(),
        adminAPI.getBookings()
      ]);
      setStats(statsRes.data);
      setHotels(hotelsRes.data.hotels);
      setUsers(usersRes.data.users);
      setBookings(bookingsRes.data.bookings);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const verifyHotel = async (id) => {
    try {
      await adminAPI.verifyHotel(id);
      toast.success('Hotel verified!');
      setHotels(prev => prev.map(h => h._id === id ? { ...h, isVerified: true } : h));
    } catch (err) { toast.error('Failed to verify'); }
  };

  const unverifyHotel = async (id) => {
    try {
      await adminAPI.unverifyHotel(id);
      toast.success('Hotel unverified');
      setHotels(prev => prev.map(h => h._id === id ? { ...h, isVerified: false } : h));
    } catch (err) { toast.error('Failed'); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) { toast.error('Failed to delete user'); }
  };

  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  if (loading) return <LoadingSpinner text="Loading admin dashboard..." />;

  const totalRevenue = stats?.totalRevenue || bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.totalPrice || 0), 0);
  const pendingHotels = hotels.filter(h => !h.isVerified);

  const filteredHotels = hotels.filter(h => h.name?.toLowerCase().includes(searchQuery.toLowerCase()) || h.address?.city?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredBookings = bookings.filter(b => b.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || b.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="dashboard-page">
      <div className="container">
        <motion.div className="dashboard-header" initial="hidden" animate="visible" variants={fadeUp}>
          <div>
            <h1>Admin Dashboard 🛡️</h1>
            <p>Platform overview and management controls.</p>
          </div>
          {pendingHotels.length > 0 && (
            <div className="admin-alert" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-md)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-warning)' }}>
              <Shield size={18} /> {pendingHotels.length} hotel(s) awaiting verification
            </div>
          )}
        </motion.div>

        <div className="dashboard-stats">
          <motion.div className="stat-card" variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.05 }}>
            <div className="stat-icon" style={{ background: 'var(--gradient-primary)' }}><Hotel size={24} /></div>
            <div><span className="stat-value">{hotels.length}</span><span className="stat-label">Hotels</span></div>
          </motion.div>
          <motion.div className="stat-card" variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}><Users size={24} /></div>
            <div><span className="stat-value">{users.length}</span><span className="stat-label">Users</span></div>
          </motion.div>
          <motion.div className="stat-card" variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}><Calendar size={24} /></div>
            <div><span className="stat-value">{bookings.length}</span><span className="stat-label">Bookings</span></div>
          </motion.div>
          <motion.div className="stat-card" variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}><IndianRupee size={24} /></div>
            <div><span className="stat-value">₹{totalRevenue.toLocaleString('en-IN')}</span><span className="stat-label">Revenue</span></div>
          </motion.div>
        </div>

        <div className="admin-search-wrapper">
          <div className="admin-search-box">
            <Search size={18} className="admin-search-icon" />
            <input type="text" className="form-input admin-search-input" placeholder="Search hotels, users, bookings..."
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>

        <div className="dashboard-tabs">
          <button className={`dashboard-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
          <button className={`dashboard-tab ${activeTab === 'hotels' ? 'active' : ''}`} onClick={() => setActiveTab('hotels')}>Hotels ({hotels.length})</button>
          <button className={`dashboard-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users ({users.length})</button>
          <button className={`dashboard-tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>Bookings ({bookings.length})</button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial="hidden" animate="visible" exit="hidden" variants={fadeUp}>
              <div className="admin-overview-grid">
                <div className="admin-card">
                  <div className="admin-card-header">
                    <Calendar size={18} />
                    <h3>Recent Bookings</h3>
                  </div>
                  <div className="admin-card-body">
                    {bookings.slice(0, 5).map(b => (
                      <div key={b._id} className="admin-list-item">
                        <div className="admin-list-info">
                          <strong>{b.user?.name || 'Guest'}</strong>
                          <span>{b.hotel?.name}</span>
                        </div>
                        <div className="admin-list-meta">
                          <span className={`status-badge status-${b.status}`}>{b.status}</span>
                          <span className="admin-list-price">₹{b.totalPrice?.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="admin-card">
                  <div className="admin-card-header">
                    <Shield size={18} />
                    <h3>Pending Verification</h3>
                  </div>
                  <div className="admin-card-body">
                    {pendingHotels.length === 0 ? (
                      <div className="admin-empty-notice">All hotels are verified! ✓</div>
                    ) : (
                      pendingHotels.map(h => (
                        <div key={h._id} className="admin-list-item">
                          <div className="admin-list-info">
                            <strong>{h.name}</strong>
                            <span>{h.address?.city}, {h.address?.country}</span>
                          </div>
                          <button className="btn btn-primary btn-sm" onClick={() => verifyHotel(h._id)}><Check size={14} /> Verify</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="admin-card admin-revenue-card">
                <div className="admin-card-header">
                  <TrendingUp size={18} />
                  <h3>Revenue by Booking Status</h3>
                </div>
                <div className="admin-card-body">
                  <div className="admin-revenue-grid">
                    {['confirmed', 'checked-in', 'checked-out', 'pending', 'cancelled'].map(status => {
                      const count = bookings.filter(b => b.status === status).length;
                      const rev = bookings.filter(b => b.status === status).reduce((s, b) => s + (b.totalPrice || 0), 0);
                      return (
                        <div key={status} className="admin-revenue-tile">
                          <span className={`status-badge status-${status}`}>{status}</span>
                          <span className="admin-revenue-count">{count}</span>
                          <span className="admin-revenue-amount">₹{rev.toLocaleString('en-IN')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'hotels' && (
            <motion.div key="hotels" initial="hidden" animate="visible" exit="hidden" variants={fadeUp}>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr><th>Hotel</th><th>Location</th><th>Owner</th><th>Category</th><th>Rating</th><th>Eco Score</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredHotels.map(h => (
                      <tr key={h._id}>
                        <td><strong>{h.name}</strong></td>
                        <td>{h.address?.city}, {h.address?.country}</td>
                        <td>{h.owner?.name || '—'}</td>
                        <td><span className="hotel-category-badge">{h.category}</span></td>
                        <td>⭐ {h.rating?.average?.toFixed(1) || 'N/A'}</td>
                        <td>{h.sustainability?.score || 0}%</td>
                        <td>{h.isVerified ? <span style={{ color: 'var(--color-primary)' }}>✓ Verified</span> : <span style={{ color: 'var(--color-warning)' }}>Pending</span>}</td>
                        <td>
                          {h.isVerified ? (
                            <button className="btn btn-outline btn-sm" onClick={() => unverifyHotel(h._id)}><X size={14} /> Unverify</button>
                          ) : (
                            <button className="btn btn-primary btn-sm" onClick={() => verifyHotel(h._id)}><Check size={14} /> Verify</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div key="users" initial="hidden" animate="visible" exit="hidden" variants={fadeUp}>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u._id}>
                        <td><strong>{u.name}</strong></td>
                        <td>{u.email}</td>
                        <td><span className={`status-badge status-${u.role === 'admin' ? 'confirmed' : u.role === 'owner' ? 'pending' : 'checked-out'}`}>{u.role}</span></td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          {u.role !== 'admin' && (
                            <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id)}><Trash2 size={14} /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div key="bookings" initial="hidden" animate="visible" exit="hidden" variants={fadeUp}>
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr><th>Ticket</th><th>Guest</th><th>Hotel</th><th>Room</th><th>Check-in</th><th>Check-out</th><th>Total</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map(b => (
                      <tr key={b._id}>
                        <td><code>{b.ticketNumber}</code></td>
                        <td>{b.user?.name || '—'}</td>
                        <td>{b.hotel?.name || '—'}</td>
                        <td>{b.room?.name || '—'}</td>
                        <td>{new Date(b.checkIn).toLocaleDateString()}</td>
                        <td>{new Date(b.checkOut).toLocaleDateString()}</td>
                        <td><strong>₹{b.totalPrice?.toLocaleString('en-IN')}</strong></td>
                        <td><span className={`status-badge status-${b.status}`}>{b.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
