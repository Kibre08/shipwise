import React, { useState, useEffect } from 'react';
import { Truck, MapPin, CheckCircle, Navigation, Phone, List } from 'lucide-react';
import { getCourierTasks, updateShipment } from '../services/api';
import MapComponent from '../components/MapComponent';
import { geocodeAddress } from '../services/geocoding';

const CourierDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState(sessionStorage.getItem('sw_courier_tab') || 'tasks');
  const [shipments, setShipments] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [currentDeliveryId, setCurrentDeliveryId] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    sessionStorage.setItem('sw_courier_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const res = await getCourierTasks();
      const activeShipments = res.data;
      setShipments(activeShipments);

      // Extract markers for the map
      const mapMarkers = [];
      for (const ship of activeShipments) {
        if (ship.status !== 'Delivered') {
          if (ship.destinationLat && ship.destinationLng) {
            mapMarkers.push({
              lat: ship.destinationLat,
              lng: ship.destinationLng,
              title: ship.trackingId,
              description: `📍 Exact Pin | To: ${ship.receiver} - ${ship.destinationAddress}`
            });
          } else if (ship.destinationAddress && ship.destinationAddress !== 'Pending') {
            const coords = await geocodeAddress(ship.destinationAddress);
            if (coords) {
              mapMarkers.push({
                lat: coords.lat,
                lng: coords.lng,
                title: ship.trackingId,
                description: `To: ${ship.receiver} - ${ship.item}`
              });
            }
          }
        }
      }
      setMarkers(mapMarkers);
    } catch (err) {
      console.error("Error fetching shipments for courier:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (trackingId, newStatus, pin = null) => {
    try {
      const location = newStatus === 'Delivered' ? 'Destination' : 'In Transit';
      const payload = { status: newStatus, location };
      if (pin) payload.pin = pin;

      await updateShipment(trackingId, payload);
      fetchShipments();
      
      if (newStatus === 'Delivered') {
        setPinModalOpen(false);
        setPinInput('');
        setPinError('');
      }
    } catch (err) {
      if (newStatus === 'Delivered') {
        setPinError(err.response?.data?.message || err.message);
      } else {
        alert("Error updating status: " + err.message);
      }
    }
  };

  const getGoogleMapsUrl = (shipment) => {
    if (shipment.destinationLat && shipment.destinationLng) {
      return `https://www.google.com/maps/dir/?api=1&destination=${shipment.destinationLat},${shipment.destinationLng}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shipment.destinationAddress)}`;
  };

  const statusFlow = ['Pre-advised', 'Received', 'Pending', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'];

  return (
    <div className="courier-container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.5rem', margin: 0, color: '#1E293B' }}>Courier Portal</h3>
        <div style={{ display: 'flex', background: '#F1F5F9', padding: '0.4rem', borderRadius: '10px', gap: '0.4rem' }}>
          <button 
            onClick={() => setActiveTab('tasks')}
            style={{ 
              padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600',
              background: activeTab === 'tasks' ? 'white' : 'transparent',
              color: activeTab === 'tasks' ? '#1E293B' : '#64748B',
              boxShadow: activeTab === 'tasks' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <List size={18} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />
            Active Tasks
          </button>
          <button 
            onClick={() => setActiveTab('map')}
            style={{ 
              padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600',
              background: activeTab === 'map' ? 'white' : 'transparent',
              color: activeTab === 'map' ? '#1E293B' : '#64748B',
              boxShadow: activeTab === 'map' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <MapPin size={18} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />
            Route Map
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading Assignments...</p>
      ) : (
        <>
          {activeTab === 'tasks' && (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {shipments.map((shipment) => (
                <div key={shipment._id} className="card hover-card" style={{ borderLeft: `4px solid ${shipment.status === 'Delivered' ? '#10B981' : '#F59E0B'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <Truck size={20} color="#F97316" />
                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{shipment.trackingId}</span>
                        <span style={{ background: '#F1F5F9', color: '#475569', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          {shipment.status.toUpperCase()}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.95rem', color: '#334155', fontWeight: '600' }}>{shipment.item}</p>
                      <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem' }}>Recipient: {shipment.receiver} · {shipment.receiverPhone}</p>
                      <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={14} /> {shipment.destinationAddress}
                      </p>
                      
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                        <a href={`tel:${shipment.receiverPhone}`} className="btn-accent" style={{ background: '#3B82F6' }}>
                          <Phone size={14} /> Call Customer
                        </a>
                        <a href={getGoogleMapsUrl(shipment)} target="_blank" rel="noopener noreferrer" className="btn-accent" style={{ background: '#10B981' }}>
                          <Navigation size={14} /> Open Maps
                        </a>
                      </div>
                    </div>
                    
                    <div style={{ marginLeft: '1rem' }}>
                      {statusFlow.map((status, index) => {
                        const currentIndex = statusFlow.indexOf(shipment.status);
                        if (index === currentIndex + 1) {
                          return (
                            <button 
                              key={status}
                              className="btn-primary"
                              style={{ background: '#0F172A', color: 'white' }}
                              onClick={() => {
                                if (status === 'Delivered') {
                                  setCurrentDeliveryId(shipment.trackingId);
                                  setPinModalOpen(true);
                                  setPinError('');
                                } else {
                                  handleUpdateStatus(shipment.trackingId, status);
                                }
                              }}
                            >
                              Move to {status}
                            </button>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              ))}
              {shipments.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '4rem', color: '#94A3B8' }}>
                  <Truck size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <p>No active shipments assigned to you.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'map' && (
            <div className="card" style={{ padding: 0, overflow: 'hidden', height: '600px' }}>
              <MapComponent 
                centerLat={markers.length > 0 ? markers[0].lat : 9.0300} 
                centerLng={markers.length > 0 ? markers[0].lng : 38.7400} 
                zoom={markers.length > 0 ? 13 : 11}
                markers={markers} 
                height="100%" 
              />
            </div>
          )}
        </>
      )}

      {pinModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '350px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem' }}>Verify Delivery PIN</h3>
            <p style={{ fontSize: '0.9rem', color: '#64748B', marginBottom: '1.5rem' }}>Ask the customer for their 4-digit PIN.</p>
            {pinError && <div style={{ color: '#EF4444', marginBottom: '1rem', fontSize: '0.85rem' }}>{pinError}</div>}
            <input 
              type="text" placeholder="PIN" maxLength={4}
              style={{ width: '100%', padding: '1rem', fontSize: '1.5rem', textAlign: 'center', letterSpacing: '0.5rem', borderRadius: '8px', border: '2px solid #E2E8F0', marginBottom: '1.5rem' }}
              value={pinInput} onChange={(e) => setPinInput(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-accent" style={{ flex: 1, background: '#10B981' }} onClick={() => handleUpdateStatus(currentDeliveryId, 'Delivered', pinInput)}>Verify</button>
              <button className="btn-primary" style={{ flex: 1, background: '#E2E8F0', color: '#1E293B' }} onClick={() => setPinModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourierDashboard;
