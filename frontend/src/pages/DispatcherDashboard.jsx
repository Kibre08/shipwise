import React, { useState, useEffect } from 'react';
import {
  Plus, Package, Send, QrCode, BarChart3, Users,
  Search, Trash2, Truck, CheckCircle, Clock, AlertCircle,
  Download, UserCheck, X, MapPin, RefreshCw
} from 'lucide-react';
import {
  createShipment, getAllShipments, receiveShipment,
  assignCourier, cancelShipment, getAnalytics, getAllCouriers
} from '../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  'Pre-advised': { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
  'Received':    { bg: '#DBEAFE', color: '#1E3A8A', dot: '#3B82F6' },
  'Pending':     { bg: '#F1F5F9', color: '#475569', dot: '#94A3B8' },
  'In Transit':  { bg: '#EDE9FE', color: '#4C1D95', dot: '#8B5CF6' },
  'Picked Up':   { bg: '#E0F2FE', color: '#075985', dot: '#0EA5E9' },
  'Out for Delivery': { bg: '#FEF9C3', color: '#713F12', dot: '#EAB308' },
  'Delivered':   { bg: '#DCFCE7', color: '#14532D', dot: '#22C55E' },
};

const StatusBadge = ({ status }) => {
  const c = STATUS_COLORS[status] || { bg: '#F1F5F9', color: '#475569', dot: '#94A3B8' };
  return (
    <span style={{ background: c.bg, color: c.color, padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
      {status}
    </span>
  );
};

const StatCard = ({ icon, label, value, color, sub }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.2rem 1.5rem' }}>
    <div style={{ background: `${color}20`, padding: '0.75rem', borderRadius: '12px' }}>
      {React.cloneElement(icon, { size: 24, color })}
    </div>
    <div>
      <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0F172A', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.2rem' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.72rem', color }}>{sub}</div>}
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const DispatcherDashboard = () => {
  const [activeTab, setActiveTab] = useState(sessionStorage.getItem('sw_dispatcher_tab') || 'analytics');

  useEffect(() => {
    sessionStorage.setItem('sw_dispatcher_tab', activeTab);
  }, [activeTab]);

  const [shipments, setShipments] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalShipments, setTotalShipments] = useState(0);
  const [couriers, setCouriers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Shipment list state
  const [searchQuery, setSearchQuery] = useState(sessionStorage.getItem('sw_dispatcher_search') || '');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    sessionStorage.setItem('sw_dispatcher_search', searchQuery);
  }, [searchQuery]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(null); // holds shipment
  const [scanInput, setScanInput] = useState('');

  const [formData, setFormData] = useState({
    sender: '', receiver: '', receiverPhone: '',
    originAddress: '', destinationAddress: '', item: ''
  });

  // ── Data fetching ────────────────────────────────────────────────────────────
  const fetchShipments = async (page = 1, search = '') => {
    try {
      const res = await getAllShipments(page, 10);
      setShipments(res.data.shipments);
      setTotalPages(res.data.totalPages);
      setCurrentPage(res.data.currentPage);
      setTotalShipments(res.data.totalShipments);
    } catch (err) {
      console.error('Shipment fetch error', err);
    }
  };

  const fetchAll = async (page = 1, search = searchQuery) => {
    setLoading(true);
    try {
      const [sRes, cRes, aRes] = await Promise.all([
        getAllShipments(page, 10, search),
        getAllCouriers(),
        getAnalytics(),
      ]);
      setShipments(sRes.data.shipments);
      setTotalPages(sRes.data.totalPages);
      setCurrentPage(sRes.data.currentPage);
      setTotalShipments(sRes.data.totalShipments);
      
      setCouriers(cRes.data);
      setAnalytics(aRes.data);
    } catch (err) {
      console.error('Fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(1); }, []);

  // Handle Search with local state
  useEffect(() => {
    const timer = setTimeout(() => {
      // Avoid redundant fetch if we already searched in handleReceive
      fetchShipments(1, searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Actions ──────────────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createShipment(formData);
      setShowCreateModal(false);
      setFormData({ sender: '', receiver: '', receiverPhone: '', originAddress: '', destinationAddress: '', item: '' });
      fetchAll(1, ''); // Reset search when creating new
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleReceive = async (trackingId) => {
    try {
      await receiveShipment(trackingId);
      setScanInput('');
      // Update local state AND fetch immediately with the query
      setSearchQuery(trackingId);
      setStatusFilter('all');
      setActiveTab('shipments');
      fetchAll(1, trackingId); 
    } catch (err) { alert('Error: ' + err.message); }
  };

  const handleAssign = async (trackingId, courier) => {
    try {
      await assignCourier(trackingId, { courierId: courier._id, courierName: courier.name });
      setShowAssignModal(null);
      fetchAll(currentPage);
    } catch (err) { alert('Error assigning courier: ' + err.message); }
  };

  const handleCancel = async (trackingId) => {
    if (!window.confirm(`Cancel shipment ${trackingId}? This cannot be undone.`)) return;
    try {
      await cancelShipment(trackingId);
      setSelectedShipment(null);
      fetchAll(currentPage);
    } catch (err) { alert('Error cancelling shipment: ' + err.message); }
  };

  const handleExportCSV = () => {
    // Note: This only exports current page. Production usually exports full dataset via dedicated endpoint.
    const rows = [
      ['Tracking ID', 'Status', 'Sender', 'Receiver', 'Phone', 'Item', 'Origin', 'Destination', 'Courier', 'Created'],
      ...shipments.map(s => [
        s.trackingId, s.status, s.sender, s.receiver, s.receiverPhone,
        s.item, s.originAddress, s.destinationAddress,
        s.courierName || s.courierId || 'Unassigned',
        new Date(s.createdAt).toLocaleDateString()
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'shipwise_report_page.csv'; a.click();
  };

  // ── Client-side filtering for the CURRENT PAGE results
  const filteredShipments = shipments.filter(s => {
    const matchStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchStatus;
  });

  // ── Courier workload (used by Analytics + Couriers tabs)
  const courierLoad = couriers.map(c => ({
    ...c,
    active: shipments.filter(s => s.courierId === c._id && s.status !== 'Delivered').length,
    delivered: shipments.filter(s => s.courierId === c._id && s.status === 'Delivered').length,
  }));

  // ── Tabs (no Live Map)
  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> },
    { id: 'shipments', label: 'Shipments', icon: <Package size={16} /> },
    { id: 'couriers',  label: 'Couriers',  icon: <Users size={16} /> },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

      {/* ── Top bar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>Dispatcher Command Center</h3>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.25rem' }}>Full control of your logistics network</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchAll} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#F1F5F9', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', color: '#475569' }}>
            <RefreshCw size={15} /> Refresh
          </button>
          <button onClick={handleExportCSV} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#0F172A', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
            <Download size={15} /> Export CSV
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn-accent" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}>
            <Plus size={15} /> New Shipment
          </button>
        </div>
      </div>

      {/* Global Scan & Receive Bar */}
      <div className="card hover-card" style={{ marginBottom: '1.5rem', background: '#F8FAFC', border: '2px dashed #CBD5E1', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', margin: 0 }}><QrCode size={18} /> Quick Scan Receipt</h4>
          <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Receive customers' pre-advised drop-offs instantly</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input type="text" placeholder="Scan or Paste Tracking ID (e.g. SW-123456)" value={scanInput}
            onChange={e => setScanInput(e.target.value.toUpperCase())}
            onKeyPress={e => e.key === 'Enter' && scanInput && handleReceive(scanInput)}
            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid #94A3B8', fontSize: '1rem', letterSpacing: '0.05rem', fontWeight: 'bold' }} />
          <button className="btn-accent" style={{ background: '#10B981', padding: '0 2rem', fontWeight: 'bold' }}
            onClick={() => { if (scanInput) handleReceive(scanInput); }}>
            Process Scan
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', borderRadius: '6px 6px 0 0', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600',
              background: activeTab === t.id ? '#0F172A' : 'transparent',
              color: activeTab === t.id ? 'white' : '#64748B',
              borderBottom: activeTab === t.id ? '2px solid #F97316' : '2px solid transparent',
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading && <p style={{ textAlign: 'center', color: '#94A3B8' }}>Loading data...</p>}
      {!loading && (
        <>
          {/* ═══════════════ ANALYTICS TAB ═══════════════ */}
          {activeTab === 'analytics' && analytics && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                <StatCard icon={<Package />} label="Total Shipments" value={analytics.total} color="#6366F1" />
                <StatCard icon={<Clock />} label="Awaiting Drop-off" value={analytics.preAdvised} color="#F59E0B" />
                <StatCard icon={<Truck />} label="Active in Network" value={analytics.active} color="#3B82F6" />
                <StatCard icon={<CheckCircle />} label="Delivered" value={analytics.delivered} color="#22C55E" sub={`${analytics.deliveredToday} today`} />
                <StatCard icon={<MapPin />} label="GPS-Pinned Deliveries" value={analytics.withGPS} color="#EC4899" />
                <StatCard icon={<Users />} label="Active Couriers" value={couriers.length} color="#8B5CF6" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="card hover-card">
                  <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><BarChart3 size={18} color="#6366F1" /> Status Breakdown</h4>
                  {Object.keys(STATUS_COLORS).map(status => {
                    const count = shipments.filter(s => s.status === status).length;
                    const pct = analytics.total ? Math.round((count / analytics.total) * 100) : 0;
                    const c = STATUS_COLORS[status];
                    return (
                      <div key={status} style={{ marginBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.2rem' }}>
                          <span style={{ color: '#475569' }}>{status}</span>
                          <span style={{ fontWeight: 'bold' }}>{count} ({pct}%)</span>
                        </div>
                        <div style={{ background: '#F1F5F9', borderRadius: '999px', height: '6px' }}>
                          <div style={{ width: `${pct}%`, background: c.dot, height: '6px', borderRadius: '999px', transition: 'width 0.5s' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="card hover-card">
                  <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={18} color="#8B5CF6" /> Courier Performance</h4>
                  {courierLoad.length === 0 && <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>No couriers registered yet.</p>}
                  {courierLoad.map(c => (
                    <div key={c._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #F1F5F9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#EDE9FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 'bold', color: '#7C3AED' }}>
                          {c.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.87rem' }}>{c.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{c.email}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ color: '#3B82F6', fontWeight: 'bold', fontSize: '0.85rem' }}>{c.active} active</span>
                        <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}> / {c.delivered} done</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════ SHIPMENTS TAB ═══════════════ */}
          {activeTab === 'shipments' && (
            <div>
              {/* Search + Filter */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input type="text" placeholder="Search by tracking ID, sender, or receiver..."
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.2rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.87rem' }} />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  style={{ padding: '0.65rem 1rem', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.87rem', color: '#475569' }}>
                  <option value="all">All Statuses</option>
                  {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Showing {filteredShipments.length} on this page (Total: {totalShipments})</p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => fetchAll(currentPage - 1)}
                    style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid #E2E8F0', background: 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.8rem' }}
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: '0.8rem', color: '#64748B' }}>Page {currentPage} of {totalPages}</span>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => fetchAll(currentPage + 1)}
                    style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid #E2E8F0', background: 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontSize: '0.8rem' }}
                  >
                    Next
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gap: '0.75rem' }}>
                {filteredShipments.map(s => (
                  <div key={s._id} className="card hover-card" style={{ borderLeft: `4px solid ${STATUS_COLORS[s.status]?.dot || '#94A3B8'}`, padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: '700', fontSize: '1rem' }}>{s.trackingId}</span>
                          <StatusBadge status={s.status} />
                          {s.courierName && <span style={{ fontSize: '0.75rem', background: '#EDE9FE', color: '#7C3AED', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>🚗 {s.courierName}</span>}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                          <strong>{s.sender}</strong> → <strong>{s.receiver}</strong> &nbsp;·&nbsp; {s.item}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.2rem' }}>
                          📍 {s.originAddress} → {s.destinationAddress}
                          {s.destinationLat && <span style={{ marginLeft: '0.5rem', color: '#10B981' }}>· GPS ✓</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem', alignItems: 'center' }}>
                        {(s.status === 'Received' || s.status === 'Pending') && (
                          <button onClick={() => setShowAssignModal(s)}
                            style={{ fontSize: '0.8rem', background: '#EDE9FE', color: '#7C3AED', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <UserCheck size={13} /> Assign Courier
                          </button>
                        )}
                        <button onClick={() => setSelectedShipment(s)}
                          style={{ fontSize: '0.8rem', background: '#F1F5F9', color: '#475569', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '5px', cursor: 'pointer' }}>
                          View Info
                        </button>
                        {(s.status === 'Pre-advised' || s.status === 'Pending') && (
                          <button onClick={() => handleCancel(s.trackingId)}
                            style={{ fontSize: '0.8rem', background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', padding: '0.4rem 0.6rem', borderRadius: '5px', cursor: 'pointer' }}>
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredShipments.length === 0 && <p style={{ textAlign: 'center', color: '#94A3B8', padding: '2rem 0' }}>No shipments found.</p>}
              </div>
            </div>
          )}

          {/* ═══════════════ COURIERS TAB ═══════════════ */}
          {activeTab === 'couriers' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {courierLoad.length === 0 && <p style={{ color: '#94A3B8' }}>No couriers registered yet. Register a Courier account to see them here.</p>}
                {courierLoad.map(c => (
                  <div key={c._id} className="card" style={{ borderTop: '3px solid #7C3AED' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>
                        {c.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '1rem' }}>{c.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{c.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div style={{ background: '#EFF6FF', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#2563EB' }}>{c.active}</div>
                        <div style={{ fontSize: '0.73rem', color: '#64748B' }}>Active Deliveries</div>
                      </div>
                      <div style={{ background: '#F0FDF4', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#16A34A' }}>{c.delivered}</div>
                        <div style={{ fontSize: '0.73rem', color: '#64748B' }}>Completed</div>
                      </div>
                    </div>
                    {c.active > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '0.5rem', fontWeight: 'bold' }}>Active Shipments:</p>
                        {shipments.filter(s => s.courierId === c._id && s.status !== 'Delivered').map(s => (
                          <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px solid #F1F5F9', fontSize: '0.8rem' }}>
                            <span style={{ fontWeight: '600' }}>{s.trackingId}</span>
                            <StatusBadge status={s.status} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════ MAP TAB ═══════════════ */}
          {activeTab === 'map' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Live Delivery Network Map</h4>
                  <p style={{ color: '#64748B', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                    Showing {mapMarkers.length} active GPS-pinned deliveries
                  </p>
                </div>
              </div>
              {mapMarkers.length > 0 ? (
                <MapComponent
                  centerLat={mapMarkers[0].lat} centerLng={mapMarkers[0].lng}
                  markers={mapMarkers} zoom={12} height="520px"
                />
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '4rem', color: '#94A3B8' }}>
                  <MapPin size={40} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.4 }} />
                  <p>No GPS-pinned deliveries active right now.</p>
                  <p style={{ fontSize: '0.8rem' }}>Shipments with exact GPS coordinates will appear here.</p>
                </div>
              )}
              {mapMarkers.length > 0 && (
                <div style={{ marginTop: '1rem', display: 'grid', gap: '0.5rem' }}>
                  {mapMarkers.map((m, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', background: '#F8FAFC', borderRadius: '6px', fontSize: '0.83rem' }}>
                      <MapPin size={14} color="#EC4899" />
                      <strong>{m.title}</strong>
                      <span style={{ color: '#64748B' }}>{m.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ═══ SHIPMENT DETAIL MODAL ═══ */}
      {selectedShipment && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.55)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0 }}>📦 {selectedShipment.trackingId}</h3>
              <button onClick={() => setSelectedShipment(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={20} /></button>
            </div>
            <StatusBadge status={selectedShipment.status} />
            <div style={{ display: 'grid', gap: '1rem', marginTop: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#F8FAFC', padding: '1rem', borderRadius: '8px' }}>
                <div><strong style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', textTransform: 'uppercase' }}>Sender</strong>{selectedShipment.sender}</div>
                <div><strong style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', textTransform: 'uppercase' }}>Receiver</strong>{selectedShipment.receiver}<br />
                  <a href={`tel:${selectedShipment.receiverPhone}`} style={{ color: '#3B82F6', fontSize: '0.87rem' }}>{selectedShipment.receiverPhone}</a>
                </div>
              </div>
              <div><strong style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', textTransform: 'uppercase' }}>Item</strong>{selectedShipment.item}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><strong style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', textTransform: 'uppercase' }}>Origin</strong>{selectedShipment.originAddress}</div>
                <div><strong style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', textTransform: 'uppercase' }}>Destination</strong>{selectedShipment.destinationAddress}</div>
              </div>
              {selectedShipment.courierName && <div><strong style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', textTransform: 'uppercase' }}>Assigned Courier</strong>{selectedShipment.courierName}</div>}
              <div>
                <strong style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', textTransform: 'uppercase', marginBottom: '0.5rem' }}>History</strong>
                {selectedShipment.history?.map((h, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.4rem', fontSize: '0.83rem' }}>
                    <span style={{ color: '#94A3B8' }}>{new Date(h.timestamp).toLocaleString()}</span>
                    <StatusBadge status={h.status} />
                    <span style={{ color: '#64748B' }}>{h.location}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              {(selectedShipment.status === 'Pre-advised' || selectedShipment.status === 'Pending') && (
                <button onClick={() => handleCancel(selectedShipment.trackingId)} style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Trash2 size={14} /> Cancel Shipment
                </button>
              )}
              <button onClick={() => setSelectedShipment(null)} style={{ background: '#F1F5F9', color: '#475569', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ASSIGN COURIER MODAL ═══ */}
      {showAssignModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.55)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '420px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0 }}>Assign Courier</h3>
              <button onClick={() => setShowAssignModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={20} /></button>
            </div>
            <p style={{ color: '#64748B', fontSize: '0.87rem', marginBottom: '1rem' }}>Shipment: <strong>{showAssignModal.trackingId}</strong> → {showAssignModal.receiver}</p>
            {couriers.length === 0 && <p style={{ color: '#EF4444', fontSize: '0.85rem' }}>No couriers registered. Please register a Courier account first.</p>}
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {couriers.map(c => (
                <button key={c._id} onClick={() => handleAssign(showAssignModal.trackingId, c)}
                  style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                    {c.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{c.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                      {courierLoad.find(cl => cl._id === c._id)?.active || 0} active deliveries
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ CREATE SHIPMENT MODAL ═══ */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.55)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '420px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0 }}>Create New Shipment</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'grid', gap: '0.9rem' }}>
              {[
                ['sender', 'Sender Name'],
                ['receiver', 'Receiver Name'],
                ['receiverPhone', 'Receiver Phone', 'tel'],
                ['originAddress', 'Pickup Address'],
                ['destinationAddress', 'Delivery Address'],
                ['item', 'Item Description'],
              ].map(([field, label, type]) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#64748B', marginBottom: '0.3rem' }}>{label}</label>
                  <input required type={type || 'text'}
                    style={{ width: '100%', padding: '0.65rem', border: '1px solid #E2E8F0', borderRadius: '6px' }}
                    value={formData[field]} onChange={e => setFormData({ ...formData, [field]: e.target.value })} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn-accent" style={{ flex: 1, padding: '0.75rem' }}>Create Shipment</button>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, background: '#F1F5F9', color: '#475569', border: 'none', padding: '0.75rem', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DispatcherDashboard;
