import React, { useState, useEffect } from 'react';
import { Search, Package, MapPin, Clock, CheckCircle, Send, QrCode, FileText, AlertTriangle, Navigation, LocateFixed } from 'lucide-react';
import { trackShipment, createSenderShipment, getMyShipments } from '../services/api';
import MapComponent from '../components/MapComponent';

const statusSteps = ['Pre-advised', 'Received', 'In Transit', 'Out for Delivery', 'Delivered'];

const CustomerDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState(sessionStorage.getItem('sw_customer_tab') || 'track');

  useEffect(() => {
    sessionStorage.setItem('sw_customer_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    fetchMyShipments();
  }, []);
  
  // Track State
  const [trackingId, setTrackingId] = useState(sessionStorage.getItem('sw_customer_tracking') || '');
  const [shipment, setShipment] = useState(null);

  useEffect(() => {
    sessionStorage.setItem('sw_customer_tracking', trackingId);
  }, [trackingId]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Send State
  const [sendForm, setSendForm] = useState({ 
    sender: user?.name || '', 
    receiver: '', 
    receiverPhone: '', 
    item: '', 
    originAddress: '', 
    destinationAddress: '', 
    destinationLat: '', 
    destinationLng: '' 
  });
  const [destinationInput, setDestinationInput] = useState('');
  const [myShipments, setMyShipments] = useState([]);
  const [myTotalPages, setMyTotalPages] = useState(1);
  const [myCurrentPage, setMyCurrentPage] = useState(1);
  const [newLabel, setNewLabel] = useState(null);
  
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  const fetchMyShipments = async (page = 1) => {
    try {
      const res = await getMyShipments(page, 5); // 5 per page for customer
      setMyShipments(res.data.shipments);
      setMyTotalPages(res.data.totalPages);
      setMyCurrentPage(res.data.currentPage);
    } catch (err) {
      console.error("Error fetching shipments:", err);
    }
  };

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingId) return;
    setLoading(true);
    setError('');
    try {
      const res = await trackShipment(trackingId);
      setShipment(res.data);
    } catch (err) {
      setError("We couldn't find that tracking ID. Please check and try again.");
      setShipment(null);
    } finally {
      setLoading(false);
    }
  };

  const parseDestination = (input) => {
    setDestinationInput(input);
    
    // Patterns for Google Maps links
    const patterns = [
      /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/,         // ?q=lat,lng
      /@(-?\d+\.\d+),(-?\d+\.\d+)/,              // @lat,lng
      /ll=(-?\d+\.\d+),(-?\d+\.\d+)/,            // ll=lat,lng
    ];

    let extractedLat = '';
    let extractedLng = '';
    let isLink = false;

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        extractedLat = match[1];
        extractedLng = match[2];
        isLink = true;
        break;
      }
    }

    // Handle plain coordinates like "9.005401, 38.763611"
    const coordMatch = input.match(/^(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)$/);
    if (!isLink && coordMatch) {
      extractedLat = coordMatch[1];
      extractedLng = coordMatch[2];
      isLink = true;
    }

    if (isLink) {
      setSendForm(prev => ({ 
        ...prev, 
        destinationLat: extractedLat, 
        destinationLng: extractedLng,
        destinationAddress: prev.destinationAddress || 'GPS Location'
      }));
    } else {
      // If it's just text, treat it as the address and clear coords
      setSendForm(prev => ({ 
        ...prev, 
        destinationAddress: input,
        destinationLat: '',
        destinationLng: ''
      }));
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSendLoading(true);
    setSendError('');
    
    // Final validation
    if (!sendForm.originAddress || !sendForm.destinationAddress || !sendForm.receiver) {
      setSendError("Please fill in all required fields.");
      setSendLoading(false);
      return;
    }

    try {
      const payload = {
        ...sendForm,
        destinationLat: sendForm.destinationLat ? parseFloat(sendForm.destinationLat) : null,
        destinationLng: sendForm.destinationLng ? parseFloat(sendForm.destinationLng) : null,
      };
      const res = await createSenderShipment(payload);
      setNewLabel(res.data);
      // Reset form but keep sender as the user
      setSendForm({ 
        sender: user?.name || '', 
        receiver: '', 
        receiverPhone: '', 
        item: '', 
        originAddress: '', 
        destinationAddress: '', 
        destinationLat: '', 
        destinationLng: '' 
      });
      setDestinationInput('');
      fetchMyShipments();
    } catch (err) {
      setSendError(err.response?.data?.message || "Error creating shipment. Please ensure all fields are correct.");
    } finally {
      setSendLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    setGpsLoading(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode to get a readable address
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const readableAddress = data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          setSendForm(prev => ({ ...prev, originAddress: readableAddress }));
        } catch (err) {
          console.error("Reverse geocoding error", err);
          setSendForm(prev => ({ ...prev, originAddress: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` }));
        } finally {
          setGpsLoading(false);
        }
      },
      () => {
        alert('Could not get your location. Please enter your address manually.');
        setGpsLoading(false);
      }
    );
  };

  return (
    <div className="customer-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={() => { setActiveTab('track'); setShipment(null); }}
          style={{ 
            flex: 1, padding: '1rem', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem',
            background: activeTab === 'track' ? '#10B981' : '#1E293B',
            color: activeTab === 'track' ? 'white' : '#94A3B8',
            border: 'none', cursor: 'pointer', transition: 'all 0.3s',
            boxShadow: activeTab === 'track' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none'
          }}
        >
          <Search size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Track
        </button>
        <button 
          onClick={() => { setActiveTab('send'); setNewLabel(null); }}
          style={{ 
            flex: 1, padding: '1rem', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem',
            background: activeTab === 'send' ? '#F97316' : '#1E293B',
            color: activeTab === 'send' ? 'white' : '#94A3B8',
            border: 'none', cursor: 'pointer', transition: 'all 0.3s',
            boxShadow: activeTab === 'send' ? '0 4px 12px rgba(249, 115, 22, 0.3)' : 'none'
          }}
        >
          <Send size={20} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Send
        </button>
      </div>

      {/* TRACK TAB */}
      {activeTab === 'track' && (
        <>
          <div className="card hover-card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', textAlign: 'center' }}>Where is my package?</h3>
            <form onSubmit={handleTrack} style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                placeholder="Enter Tracking ID (e.g. SW-123456)"
                style={{ flex: 1, padding: '0.75rem', border: '1px solid #E2E8F0', borderRadius: '8px' }}
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
              <button type="submit" className="btn-accent" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Search size={20} /> Track
              </button>
            </form>
          </div>

          {loading && <p style={{ textAlign: 'center' }}>Searching...</p>}
          {error && <p style={{ color: '#EF4444', textAlign: 'center' }}>{error}</p>}

          {shipment && (
            <div className="card">
              <div style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '1rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Package size={24} color="#F97316" />
                    <h4 style={{ fontSize: '1.25rem' }}>Shipment {shipment.trackingId}</h4>
                  </div>
                  <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: '0.25rem' }}>{shipment.item} • From: {shipment.sender} • To: {shipment.receiver}</p>
                </div>
                <span style={{ background: '#E2E8F0', color: '#475569', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {shipment.status.toUpperCase()}
                </span>
              </div>

              {shipment.status === 'Out for Delivery' && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '2px dashed #EF4444', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'center' }}>
                  <AlertTriangle size={32} color="#EF4444" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ color: '#EF4444', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Secure Delivery Required</h4>
                  <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1rem' }}>Please provide this 4-digit PIN to the Courier when they arrive to receive your package.</p>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0F172A', letterSpacing: '0.5rem' }}>
                    {shipment.deliveryPin}
                  </div>
                </div>
              )}

              <div className="timeline" style={{ position: 'relative', paddingLeft: '2rem' }}>
                <div style={{ position: 'absolute', left: '7px', top: '5px', bottom: '5px', width: '2px', background: '#E2E8F0' }}></div>
                {statusSteps.map((status, index) => {
                  let mappedStatus = shipment.status;
                  if (shipment.status === 'Pending') mappedStatus = 'Pre-advised';
                  if (shipment.status === 'Picked Up') mappedStatus = 'Received';
                  const currentStatusIndex = statusSteps.indexOf(mappedStatus);
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  return (
                    <div key={status} style={{ position: 'relative', marginBottom: '1.5rem' }}>
                      <div style={{ 
                        position: 'absolute', left: '-26px', top: '4px', width: '16px', height: '16px', borderRadius: '50%', 
                        background: isCompleted ? '#10B981' : '#E2E8F0',
                        border: isCurrent ? '4px solid #D1FAE5' : 'none',
                        zIndex: 2
                      }}></div>
                      <div style={{ opacity: isCompleted ? 1 : 0.4 }}>
                        <h5 style={{ fontWeight: '600', color: isCompleted ? '#0F172A' : '#94A3B8' }}>{status}</h5>
                        {isCurrent && <p style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: '500' }}>Current Status</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* SEND TAB */}
      {activeTab === 'send' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
          <div>
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} color="#F97316"/> Create Shipping Draft
              </h3>
              
              {sendError && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{sendError}</div>}
              
              <form onSubmit={handleSend} style={{ display: 'grid', gap: '1.25rem' }}>
                {/* SENDER INFO */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', marginBottom: '0.25rem' }}>Sender Name</label>
                  <input type="text" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                    value={sendForm.sender} onChange={e => setSendForm({...sendForm, sender: e.target.value})} />
                </div>

                {/* PICKUP */}
                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <label style={{ fontSize: '0.9rem', color: '#15803D', fontWeight: 'bold' }}>📦 Pickup Location</label>
                    <button type="button" onClick={handleUseMyLocation} disabled={gpsLoading}
                      style={{ fontSize: '0.75rem', background: '#10B981', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Navigation size={12} /> {gpsLoading ? 'Locating...' : 'Use My GPS'}
                    </button>
                  </div>
                  <input type="text" placeholder="Enter street address or GPS coords from 'Use My GPS'" required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #BBF7D0' }}
                    value={sendForm.originAddress} onChange={e => setSendForm({...sendForm, originAddress: e.target.value})} />
                </div>

                {/* RECIPIENT */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', marginBottom: '0.25rem' }}>Recipient Name</label>
                    <input type="text" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                      value={sendForm.receiver} onChange={e => setSendForm({...sendForm, receiver: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', marginBottom: '0.25rem' }}>Recipient Phone</label>
                    <input type="tel" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                      value={sendForm.receiverPhone} onChange={e => setSendForm({...sendForm, receiverPhone: e.target.value})} />
                  </div>
                </div>

                {/* DESTINATION */}
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '1.25rem' }}>
                  <label style={{ fontSize: '0.9rem', color: '#1E40AF', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                    🚚 Delivery Destination
                  </label>
                  <p style={{ fontSize: '0.75rem', color: '#1E40AF', marginBottom: '1rem' }}>Enter street address OR paste a Google Maps link shared by the receiver.</p>
                  
                  <input
                    type="text"
                    placeholder="Address, link, or lat,lng"
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #BFDBFE', marginBottom: '0.5rem' }}
                    value={destinationInput}
                    onChange={(e) => parseDestination(e.target.value)}
                  />

                  {sendForm.destinationLat && (
                    <div style={{ background: '#DCFCE7', padding: '0.5rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <CheckCircle size={14} color="#10B981" />
                      <span style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 'bold' }}>GPS Coordinates Linked Successfully</span>
                    </div>
                  )}

                  {sendForm.destinationLat && !isNaN(parseFloat(sendForm.destinationLat)) && (
                    <div style={{ marginTop: '1rem', borderRadius: '8px', overflow: 'hidden', border: '1px solid #BFDBFE' }}>
                      <MapComponent
                        centerLat={parseFloat(sendForm.destinationLat)}
                        centerLng={parseFloat(sendForm.destinationLng)}
                        zoom={15} height="150px"
                        markers={[{ lat: parseFloat(sendForm.destinationLat), lng: parseFloat(sendForm.destinationLng), title: "Receiver Pin" }]}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748B', marginBottom: '0.25rem' }}>Item Description</label>
                  <input type="text" required placeholder="e.g. Documents, Electronics, Food"
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}
                    value={sendForm.item} onChange={e => setSendForm({...sendForm, item: e.target.value})} />
                </div>

                <button type="submit" className="btn-accent" disabled={sendLoading} 
                  style={{ background: '#F97316', padding: '1rem', marginTop: '0.5rem', fontSize: '1rem', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(249, 115, 22, 0.2)' }}>
                  {sendLoading ? 'Creating...' : 'Create Shipment Draft'}
                </button>
              </form>
            </div>
          </div>

          <div>
            {newLabel ? (
              <div className="card" style={{ border: '2px solid #F97316', background: '#FFF7ED', position: 'sticky', top: '2rem' }}>
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <QrCode size={120} color="#0F172A" style={{ margin: '0 auto', marginBottom: '1rem' }} />
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0F172A', letterSpacing: '2px' }}>{newLabel.trackingId}</h2>
                  <p style={{ color: '#F97316', fontWeight: 'bold', margin: '0.5rem 0' }}>DIGITAL LABEL READY</p>
                </div>
                <div style={{ background: 'white', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', color: '#475569' }}>
                  <p><strong>From:</strong> {newLabel.sender}</p>
                  <p><strong>To:</strong> {newLabel.receiver}</p>
                  <p><strong>Item:</strong> {newLabel.item}</p>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748B', textAlign: 'center', marginTop: '1.5rem' }}>
                  Show this tracking ID at the facility to activate your shipment.
                </p>
                <button onClick={() => setNewLabel(null)} 
                  style={{ width: '100%', marginTop: '1rem', padding: '0.5rem', background: 'transparent', border: '1px solid #F97316', color: '#F97316', borderRadius: '6px', cursor: 'pointer' }}>
                  Create Another
                </button>
              </div>
            ) : (
              <div className="card" style={{ position: 'sticky', top: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Shipment History</h3>
                {myShipments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94A3B8' }}>
                    <Package size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                    <p>No shipments yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    {myShipments.map(s => (
                      <div key={s.trackingId} style={{ border: '1px solid #E2E8F0', padding: '0.75rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ display: 'block', fontSize: '0.9rem' }}>{s.trackingId}</strong>
                          <span style={{ fontSize: '0.8rem', color: '#64748B' }}>To: {s.receiver}</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', background: '#F1F5F9', color: '#475569', borderRadius: '999px', fontWeight: 'bold' }}>
                          {s.status}
                        </span>
                      </div>
                    ))}
                    
                    {myTotalPages > 1 && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
                        <button 
                          disabled={myCurrentPage === 1}
                          onClick={() => fetchMyShipments(myCurrentPage - 1)}
                          style={{ padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid #E2E8F0', background: 'white', cursor: myCurrentPage === 1 ? 'not-allowed' : 'pointer', fontSize: '0.75rem' }}
                        >
                          Prev
                        </button>
                        <span style={{ fontSize: '0.75rem', color: '#64748B' }}>{myCurrentPage} / {myTotalPages}</span>
                        <button 
                          disabled={myCurrentPage === myTotalPages}
                          onClick={() => fetchMyShipments(myCurrentPage + 1)}
                          style={{ padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid #E2E8F0', background: 'white', cursor: myCurrentPage === myTotalPages ? 'not-allowed' : 'pointer', fontSize: '0.75rem' }}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
