import React, { useState } from 'react';
import { Truck, Search, Package, CheckCircle, Clock, MapPin, AlertCircle, ArrowLeft, Phone } from 'lucide-react';
import { trackShipment } from '../services/api';

const STATUS_STEPS = ['Pre-advised', 'Received', 'In Transit', 'Out for Delivery', 'Delivered'];

const STATUS_COLORS = {
  'Pre-advised':      { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B', icon: <Clock size={14} /> },
  'Received':         { bg: '#DBEAFE', color: '#1E3A8A', dot: '#3B82F6', icon: <Package size={14} /> },
  'Pending':          { bg: '#F1F5F9', color: '#475569', dot: '#94A3B8', icon: <Clock size={14} /> },
  'In Transit':       { bg: '#EDE9FE', color: '#4C1D95', dot: '#8B5CF6', icon: <Truck size={14} /> },
  'Out for Delivery': { bg: '#FEF9C3', color: '#713F12', dot: '#EAB308', icon: <Truck size={14} /> },
  'Delivered':        { bg: '#DCFCE7', color: '#14532D', dot: '#22C55E', icon: <CheckCircle size={14} /> },
};

const TrackPage = ({ onBack }) => {
  const [trackingId, setTrackingId] = useState('');
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return;
    setLoading(true);
    setError('');
    setShipment(null);
    try {
      const res = await trackShipment(trackingId.trim().toUpperCase());
      setShipment(res.data);
    } catch {
      setError("We couldn't find that tracking ID. Please double-check and try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStep = shipment ? STATUS_STEPS.indexOf(shipment.status) : -1;
  const normalizedStep = currentStep === -1
    ? (shipment?.status === 'Pending' ? 1 : 0)
    : currentStep;

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', color: 'white', padding: '2rem 1rem' }}>
      {/* Nav */}
      <div className="container" style={{ maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Truck size={28} color="#F97316" />
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>ShipWise</span>
          </div>
          <button onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#94A3B8', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
            <ArrowLeft size={15} /> Back to Home
          </button>
        </div>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', padding: '0.4rem 1rem', borderRadius: '20px', marginBottom: '1.5rem' }}>
            <Search size={14} color="#F97316" />
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#F97316', textTransform: 'uppercase', letterSpacing: '1px' }}>Package Tracker</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 0.75rem', lineHeight: 1.2 }}>
            Track Your Package
          </h1>
          <p style={{ color: '#64748B', fontSize: '1rem' }}>
            Enter the tracking ID shared by the sender to see your delivery status
          </p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleTrack} style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Enter Tracking ID — e.g. SW-123456"
            value={trackingId}
            onChange={e => setTrackingId(e.target.value)}
            style={{
              flex: 1, padding: '0.9rem 1.2rem', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)',
              color: 'white', fontSize: '1rem', letterSpacing: '0.05rem', outline: 'none'
            }}
          />
          <button type="submit" disabled={loading}
            style={{ background: '#F97316', color: 'white', border: 'none', padding: '0.9rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', whiteSpace: 'nowrap' }}>
            {loading ? 'Searching...' : 'Track'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertCircle size={18} color="#EF4444" />
            <span style={{ color: '#FCA5A5', fontSize: '0.9rem' }}>{error}</span>
          </div>
        )}

        {/* Result */}
        {shipment && (
          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
            {/* Status Banner */}
            {(() => {
              const s = STATUS_COLORS[shipment.status] || STATUS_COLORS['Pre-advised'];
              return (
                <div style={{ background: s.bg, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: s.dot, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                      {s.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: s.color, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Status</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A' }}>{shipment.status}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Tracking ID</div>
                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#0F172A', letterSpacing: '1px' }}>{shipment.trackingId}</div>
                  </div>
                </div>
              );
            })()}

            <div style={{ padding: '1.5rem' }}>
              {/* Progress bar */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  {STATUS_STEPS.map((step, i) => (
                    <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: i <= normalizedStep ? '#F97316' : 'rgba(255,255,255,0.1)',
                        border: `2px solid ${i <= normalizedStep ? '#F97316' : 'rgba(255,255,255,0.15)'}`,
                        transition: 'all 0.3s', marginBottom: '0.4rem', fontSize: '0.7rem', fontWeight: 'bold', color: 'white'
                      }}>
                        {i < normalizedStep ? '✓' : i + 1}
                      </div>
                      <span style={{ fontSize: '0.62rem', color: i <= normalizedStep ? '#F97316' : '#475569', textAlign: 'center', lineHeight: 1.2 }}>
                        {step.replace('Out for ', 'Out for\n')}
                      </span>
                    </div>
                  ))}
                </div>
                {/* Progress line */}
                <div style={{ position: 'relative', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, margin: '0 14px', marginTop: '-2.5rem', marginBottom: '2rem', zIndex: 0 }}>
                  <div style={{ width: `${(normalizedStep / (STATUS_STEPS.length - 1)) * 100}%`, height: '100%', background: '#F97316', borderRadius: 2, transition: 'width 0.5s' }} />
                </div>
              </div>

              {/* Package info */}
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>From</div>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{shipment.sender}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>To</div>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{shipment.receiver}</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>Item</div>
                  <div style={{ fontWeight: '600' }}>{shipment.item}</div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '1rem 1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>📦 Origin</div>
                    <div style={{ fontSize: '0.88rem' }}>{shipment.originAddress}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem' }}>🏠 Destination</div>
                    <div style={{ fontSize: '0.88rem' }}>{shipment.destinationAddress}</div>
                    {shipment.destinationLat && <span style={{ fontSize: '0.72rem', color: '#10B981' }}>· GPS ✓</span>}
                  </div>
                </div>

                {/* Courier assigned */}
                {shipment.courierName && (
                  <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '10px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Truck size={18} color="#8B5CF6" />
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#A78BFA' }}>Courier Assigned</div>
                      <div style={{ fontWeight: '600' }}>{shipment.courierName}</div>
                    </div>
                  </div>
                )}

                {/* Delivery PIN hint */}
                {shipment.status === 'Out for Delivery' && (
                  <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '10px', padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                      <CheckCircle size={16} color="#F59E0B" />
                      <span style={{ fontWeight: '700', color: '#F59E0B', fontSize: '0.9rem' }}>Your delivery is out!</span>
                    </div>
                    <p style={{ color: '#FCD34D', fontSize: '0.82rem', margin: 0 }}>
                      The courier will ask you for a <strong>4-digit Delivery PIN</strong> when they arrive. You received this PIN when the shipment was created by the sender.
                    </p>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h4 style={{ fontSize: '0.82rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>Status History</h4>
                  {[...shipment.history].reverse().map((h, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.6rem', alignItems: 'flex-start' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === 0 ? '#F97316' : '#334155', marginTop: '5px', flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{h.status}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>{h.location} · {new Date(h.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer hint */}
        {!shipment && !error && (
          <p style={{ textAlign: 'center', color: '#334155', fontSize: '0.82rem', marginTop: '2rem' }}>
            Don't have a tracking ID? Ask the sender to share it with you.
          </p>
        )}
      </div>
    </div>
  );
};

export default TrackPage;
