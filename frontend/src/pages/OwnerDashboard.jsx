import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Hotel, Plus, Edit, Trash2, Bed, Users, Calendar, IndianRupee,
  MapPin, Star, Leaf, X, Save, Image, Check, Eye, ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { hotelsAPI, roomsAPI, bookingsAPI } from '../services/api';
import toast from 'react-hot-toast';

const defaultHotel = {
  name: '', description: '', category: 'boutique',
  address: { street: '', city: '', state: '', country: 'India', zipCode: '' },
  contactPhone: '', contactEmail: '', website: '',
  amenities: [],
  sustainability: {
    solarPowered: false, rainwaterHarvesting: false, organicFood: false,
    wasteRecycling: false, electricVehicleCharging: false, carbonOffset: false,
    localSourcing: false, energyEfficient: false
  }
};

const defaultRoom = {
  name: '', type: 'double', description: '', price: 100,
  capacity: { adults: 2, children: 1 }, totalUnits: 1, floorArea: 30,
  amenities: [], ecoFeatures: []
};

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hotels');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [hotelBookings, setHotelBookings] = useState([]);

  // Modals
  const [showHotelForm, setShowHotelForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [hotelForm, setHotelForm] = useState(defaultHotel);
  const [roomForm, setRoomForm] = useState(defaultRoom);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadHotels(); }, []);

  useEffect(() => {
    if (selectedHotel) { loadRooms(); loadHotelBookings(); }
  }, [selectedHotel]);

  const loadHotels = async () => {
    setLoading(true);
    try {
      const { data } = await hotelsAPI.getMyHotels();
      setHotels(data.hotels);
      if (data.hotels.length > 0 && !selectedHotel) setSelectedHotel(data.hotels[0]);
    } catch (err) { toast.error('Failed to load hotels'); }
    finally { setLoading(false); }
  };

  const loadRooms = async () => {
    try {
      const { data } = await roomsAPI.getByHotel(selectedHotel._id);
      setRooms(Array.isArray(data) ? data : data.rooms || []);
    } catch (err) { console.error(err); }
  };

  const loadHotelBookings = async () => {
    try {
      const { data } = await bookingsAPI.getHotelBookings(selectedHotel._id);
      setHotelBookings(data.bookings);
    } catch (err) { console.error(err); }
  };

  // Hotel CRUD
  const openAddHotel = () => { setEditingHotel(null); setHotelForm(defaultHotel); setShowHotelForm(true); };
  const openEditHotel = (hotel) => {
    setEditingHotel(hotel);
    setHotelForm({
      name: hotel.name, description: hotel.description, category: hotel.category,
      address: { ...hotel.address }, contactPhone: hotel.contactPhone || '', contactEmail: hotel.contactEmail || '', website: hotel.website || '',
      amenities: hotel.amenities || [],
      sustainability: { ...hotel.sustainability }
    });
    setShowHotelForm(true);
  };

  const saveHotel = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingHotel) {
        await hotelsAPI.update(editingHotel._id, hotelForm);
        toast.success('Hotel updated!');
      } else {
        await hotelsAPI.create(hotelForm);
        toast.success('Hotel created! It will be visible after admin verification.');
      }
      setShowHotelForm(false);
      loadHotels();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const deleteHotel = async (hotelId) => {
    if (!window.confirm('Delete this hotel? This action cannot be undone.')) return;
    try {
      await hotelsAPI.delete(hotelId);
      toast.success('Hotel deleted');
      if (selectedHotel?._id === hotelId) setSelectedHotel(null);
      loadHotels();
    } catch (err) { toast.error('Failed to delete hotel'); }
  };

  // Room CRUD
  const openAddRoom = () => { setEditingRoom(null); setRoomForm(defaultRoom); setShowRoomForm(true); };
  const openEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({
      name: room.name, type: room.type, description: room.description, price: room.price?.base ?? room.price,
      capacity: room.capacity || { adults: 2, children: 1 }, totalUnits: room.totalUnits, floorArea: room.floorArea,
      amenities: room.amenities || [], ecoFeatures: room.ecoFeatures || []
    });
    setShowRoomForm(true);
  };

  const saveRoom = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingRoom) {
        await roomsAPI.update(editingRoom._id, roomForm);
        toast.success('Room updated!');
      } else {
        await roomsAPI.create({ ...roomForm, hotel: selectedHotel._id });
        toast.success('Room added!');
      }
      setShowRoomForm(false);
      loadRooms();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const deleteRoom = async (roomId) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await roomsAPI.delete(roomId);
      toast.success('Room deleted');
      loadRooms();
    } catch (err) { toast.error('Failed to delete room'); }
  };

  const toggleAmenity = (am, form, setForm) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(am) ? prev.amenities.filter(a => a !== am) : [...prev.amenities, am]
    }));
  };

  const toggleSustainability = (key) => {
    setHotelForm(prev => ({
      ...prev,
      sustainability: { ...prev.sustainability, [key]: !prev.sustainability[key] }
    }));
  };

  const allAmenities = ['wifi', 'parking', 'pool', 'restaurant', 'gym', 'spa', 'room-service', 'bar', 'laundry', 'security', 'concierge'];
  const roomTypes = ['single', 'double', 'suite', 'deluxe', 'penthouse', 'eco-pod', 'treehouse', 'cottage'];
  const categories = ['luxury', 'boutique', 'eco-lodge', 'resort', 'budget', 'villa', 'hostel'];
  const ecoFeatures = ['bamboo-furniture', 'organic-linens', 'solar-heating', 'recycled-materials', 'natural-ventilation', 'led-lighting', 'water-saving'];

  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  if (loading) return <LoadingSpinner text="Loading your properties..." />;

  const totalRev = hotelBookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.totalPrice || 0), 0);

  return (
    <div className="dashboard-page">
      <div className="container">
        <motion.div className="dashboard-header" initial="hidden" animate="visible" variants={fadeUp}>
          <div>
            <h1>Owner Dashboard 🏨</h1>
            <p>Manage your properties, rooms, and bookings.</p>
          </div>
          <button className="btn btn-primary" onClick={openAddHotel}>
            <Plus size={18} /> Add Hotel
          </button>
        </motion.div>

        {hotels.length === 0 ? (
          <motion.div className="empty-state" initial="hidden" animate="visible" variants={fadeUp}>
            <div className="empty-state-icon">🏗️</div>
            <h3>No Hotels Yet</h3>
            <p>Create your first eco-friendly hotel listing to start receiving bookings.</p>
            <button className="btn btn-primary" onClick={openAddHotel}><Plus size={18} /> Add Your First Hotel</button>
          </motion.div>
        ) : (
          <>
            {/* Hotel Selector */}
            <div className="dashboard-hotel-selector">
              {hotels.map(h => (
                <button key={h._id}
                  className={`hotel-selector-btn ${selectedHotel?._id === h._id ? 'active' : ''}`}
                  onClick={() => setSelectedHotel(h)}
                >
                  <Hotel size={16} />
                  <span>{h.name}</span>
                  {h.isVerified ? <Check size={14} style={{ color: 'var(--color-primary)' }} /> : <span className="badge-pending">Pending</span>}
                </button>
              ))}
            </div>

            {selectedHotel && (
              <>
                {/* Stats */}
                <div className="dashboard-stats">
                  <motion.div className="stat-card" variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
                    <div className="stat-icon" style={{ background: 'var(--gradient-primary)' }}><Bed size={24} /></div>
                    <div><span className="stat-value">{rooms.length}</span><span className="stat-label">Rooms</span></div>
                  </motion.div>
                  <motion.div className="stat-card" variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}><Calendar size={24} /></div>
                    <div><span className="stat-value">{hotelBookings.length}</span><span className="stat-label">Bookings</span></div>
                  </motion.div>
                  <motion.div className="stat-card" variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}><IndianRupee size={24} /></div>
                    <div><span className="stat-value">₹{totalRev.toLocaleString('en-IN')}</span><span className="stat-label">Revenue</span></div>
                  </motion.div>
                  <motion.div className="stat-card" variants={fadeUp} initial="hidden" animate="visible" transition={{ delay: 0.25 }}>
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}><Star size={24} /></div>
                    <div><span className="stat-value">{selectedHotel.rating?.average?.toFixed?.(1) || 'N/A'}</span><span className="stat-label">Rating</span></div>
                  </motion.div>
                </div>

                {/* Tabs */}
                <div className="dashboard-tabs">
                  <button className={`dashboard-tab ${activeTab === 'hotels' ? 'active' : ''}`} onClick={() => setActiveTab('hotels')}>Hotel Info</button>
                  <button className={`dashboard-tab ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>Rooms ({rooms.length})</button>
                  <button className={`dashboard-tab ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>Bookings ({hotelBookings.length})</button>
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                  {activeTab === 'hotels' && (
                    <motion.div key="hotels-tab" initial="hidden" animate="visible" exit="hidden" variants={fadeUp}>
                      <div className="owner-hotel-info-card">
                        <div className="info-card-header">
                          <h3>{selectedHotel.name}</h3>
                          <div>
                            <button className="btn btn-outline btn-sm" onClick={() => openEditHotel(selectedHotel)}><Edit size={14} /> Edit</button>
                            <button className="btn btn-danger btn-sm" style={{ marginLeft: '8px' }} onClick={() => deleteHotel(selectedHotel._id)}><Trash2 size={14} /> Delete</button>
                          </div>
                        </div>
                        <div className="info-card-body">
                          <div className="info-row"><strong>Category:</strong> <span className="hotel-category-badge">{selectedHotel.category}</span></div>
                          <div className="info-row"><strong>Location:</strong> {selectedHotel.address?.city}, {selectedHotel.address?.country}</div>
                          <div className="info-row"><strong>Status:</strong> {selectedHotel.isVerified ? <span style={{ color: 'var(--color-primary)' }}>✓ Verified</span> : <span style={{ color: 'var(--color-warning)' }}>⏳ Pending Verification</span>}</div>
                          <div className="info-row"><strong>Sustainability Score:</strong> {selectedHotel.sustainability?.score || 0}%</div>
                          <div className="info-row"><strong>Amenities:</strong> {selectedHotel.amenities?.join(', ') || 'None'}</div>
                          <p style={{ marginTop: '12px', color: 'var(--color-text-secondary)' }}>{selectedHotel.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'rooms' && (
                    <motion.div key="rooms-tab" initial="hidden" animate="visible" exit="hidden" variants={fadeUp}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
                        <button className="btn btn-primary" onClick={openAddRoom}><Plus size={16} /> Add Room</button>
                      </div>
                      {rooms.length === 0 ? (
                        <div className="empty-state" style={{ padding: '40px' }}>
                          <p>No rooms yet. Add your first room to start receiving bookings.</p>
                        </div>
                      ) : (
                        <div className="admin-table-container">
                          <table className="admin-table">
                            <thead>
                              <tr><th>Name</th><th>Type</th><th>Price</th><th>Capacity</th><th>Units</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                              {rooms.map(room => (
                                <tr key={room._id}>
                                  <td><strong>{room.name}</strong></td>
                                  <td><span className="hotel-category-badge">{room.type}</span></td>
                                  <td><span className="price-text">₹{(room.price?.base ?? room.price)?.toLocaleString('en-IN')}</span>/night</td>
                                  <td>{room.capacity?.adults || 0}A / {room.capacity?.children || 0}C</td>
                                  <td>{room.totalUnits}</td>
                                  <td>
                                    <button className="btn btn-outline btn-sm" onClick={() => openEditRoom(room)}><Edit size={14} /></button>
                                    <button className="btn btn-danger btn-sm" style={{ marginLeft: '6px' }} onClick={() => deleteRoom(room._id)}><Trash2 size={14} /></button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'bookings' && (
                    <motion.div key="bookings-tab" initial="hidden" animate="visible" exit="hidden" variants={fadeUp}>
                      {hotelBookings.length === 0 ? (
                        <div className="empty-state" style={{ padding: '40px' }}>
                          <p>No bookings yet for this hotel.</p>
                        </div>
                      ) : (
                        <div className="admin-table-container">
                          <table className="admin-table">
                            <thead>
                              <tr><th>Ticket</th><th>Guest</th><th>Room</th><th>Check-in</th><th>Check-out</th><th>Total</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                              {hotelBookings.map(b => (
                                <tr key={b._id}>
                                  <td><code>{b.ticketNumber}</code></td>
                                  <td>{b.user?.name || '—'}</td>
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
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </>
        )}
      </div>

      {/* Hotel Form Modal */}
      <AnimatePresence>
        {showHotelForm && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHotelForm(false)}>
            <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()} style={{ maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto' }}>
              <div className="modal-header">
                <h2>{editingHotel ? 'Edit Hotel' : 'Add New Hotel'}</h2>
                <button className="modal-close" onClick={() => setShowHotelForm(false)}><X size={24} /></button>
              </div>
              <div className="modal-body">
                <form onSubmit={saveHotel}>
                  <div className="form-group">
                    <label className="form-label">Hotel Name *</label>
                    <input className="form-input" value={hotelForm.name} onChange={e => setHotelForm({ ...hotelForm, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description *</label>
                    <textarea className="form-input form-textarea" rows={3} value={hotelForm.description} onChange={e => setHotelForm({ ...hotelForm, description: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input form-select" value={hotelForm.category} onChange={e => setHotelForm({ ...hotelForm, category: e.target.value })}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group"><label className="form-label">Contact Email *</label>
                      <input type="email" className="form-input" value={hotelForm.contactEmail} onChange={e => setHotelForm({ ...hotelForm, contactEmail: e.target.value })} required /></div>
                    <div className="form-group"><label className="form-label">Contact Phone</label>
                      <input className="form-input" value={hotelForm.contactPhone} onChange={e => setHotelForm({ ...hotelForm, contactPhone: e.target.value })} /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div className="form-group"><label className="form-label">City *</label>
                      <input className="form-input" value={hotelForm.address.city} onChange={e => setHotelForm({ ...hotelForm, address: { ...hotelForm.address, city: e.target.value } })} required /></div>
                    <div className="form-group"><label className="form-label">State *</label>
                      <input className="form-input" value={hotelForm.address.state} onChange={e => setHotelForm({ ...hotelForm, address: { ...hotelForm.address, state: e.target.value } })} required /></div>
                    <div className="form-group"><label className="form-label">Country *</label>
                      <input className="form-input" value={hotelForm.address.country} onChange={e => setHotelForm({ ...hotelForm, address: { ...hotelForm.address, country: e.target.value } })} required /></div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amenities</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {allAmenities.map(am => (
                        <button type="button" key={am}
                          className={`filter-chip ${hotelForm.amenities.includes(am) ? 'active' : ''}`}
                          onClick={() => toggleAmenity(am, hotelForm, setHotelForm)}>
                          {am}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sustainability Practices</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {Object.keys(defaultHotel.sustainability).map(key => (
                        <label key={key} className="sustainability-checkbox" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', background: hotelForm.sustainability[key] ? 'rgba(16,185,129,0.1)' : 'transparent', cursor: 'pointer', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
                          <input type="checkbox" checked={hotelForm.sustainability[key]} onChange={() => toggleSustainability(key)} />
                          <Leaf size={14} style={{ color: hotelForm.sustainability[key] ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                        </label>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
                    <Save size={16} /> {saving ? 'Saving...' : editingHotel ? 'Update Hotel' : 'Create Hotel'}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Room Form Modal */}
      <AnimatePresence>
        {showRoomForm && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRoomForm(false)}>
            <motion.div className="modal-content" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()} style={{ maxWidth: '560px', maxHeight: '85vh', overflowY: 'auto' }}>
              <div className="modal-header">
                <h2>{editingRoom ? 'Edit Room' : 'Add Room'}</h2>
                <button className="modal-close" onClick={() => setShowRoomForm(false)}><X size={24} /></button>
              </div>
              <div className="modal-body">
                <form onSubmit={saveRoom}>
                  <div className="form-group"><label className="form-label">Room Name *</label>
                    <input className="form-input" value={roomForm.name} onChange={e => setRoomForm({ ...roomForm, name: e.target.value })} required /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group"><label className="form-label">Type</label>
                      <select className="form-input form-select" value={roomForm.type} onChange={e => setRoomForm({ ...roomForm, type: e.target.value })}>
                        {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select></div>
                    <div className="form-group"><label className="form-label">Price/Night (₹) *</label>
                      <input type="number" className="form-input" value={roomForm.price} onChange={e => setRoomForm({ ...roomForm, price: +e.target.value })} min="1" required /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                    <div className="form-group"><label className="form-label">Adults</label>
                      <input type="number" className="form-input" value={roomForm.capacity?.adults || 2} onChange={e => setRoomForm({ ...roomForm, capacity: { ...roomForm.capacity, adults: +e.target.value } })} min="1" /></div>
                    <div className="form-group"><label className="form-label">Children</label>
                      <input type="number" className="form-input" value={roomForm.capacity?.children || 0} onChange={e => setRoomForm({ ...roomForm, capacity: { ...roomForm.capacity, children: +e.target.value } })} min="0" /></div>
                    <div className="form-group"><label className="form-label">Total Units</label>
                      <input type="number" className="form-input" value={roomForm.totalUnits} onChange={e => setRoomForm({ ...roomForm, totalUnits: +e.target.value })} min="1" /></div>
                    <div className="form-group"><label className="form-label">Floor Area (m²)</label>
                      <input type="number" className="form-input" value={roomForm.floorArea} onChange={e => setRoomForm({ ...roomForm, floorArea: +e.target.value })} min="1" /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Description</label>
                    <textarea className="form-input form-textarea" rows={2} value={roomForm.description} onChange={e => setRoomForm({ ...roomForm, description: e.target.value })} /></div>
                  <div className="form-group">
                    <label className="form-label">Eco Features</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {ecoFeatures.map(f => (
                        <button type="button" key={f}
                          className={`filter-chip ${roomForm.ecoFeatures.includes(f) ? 'active' : ''}`}
                          onClick={() => setRoomForm(prev => ({ ...prev, ecoFeatures: prev.ecoFeatures.includes(f) ? prev.ecoFeatures.filter(x => x !== f) : [...prev.ecoFeatures, f] }))}>
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
                    <Save size={16} /> {saving ? 'Saving...' : editingRoom ? 'Update Room' : 'Add Room'}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OwnerDashboard;
