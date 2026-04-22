import React from 'react';
import { Truck, Shield, Clock, Zap, ArrowRight, Package, UserCheck, Search } from 'lucide-react';

const Landing = ({ onGetStarted, onLogin }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', color: 'white', overflowX: 'hidden' }}>
      {/* Background Decoration */}
      <div style={{ 
        position: 'absolute', 
        top: '-10%', 
        right: '-5%', 
        width: '40%', 
        height: '40%', 
        background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(15,23,42,0) 70%)',
        zIndex: 0
      }}></div>

      {/* Top Navigation / Logo */}
      <nav className="container" style={{ paddingTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Truck size={32} color="#F97316" />
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'white', margin: 0, letterSpacing: '-0.5px' }}>ShipWise</h1>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <button 
            onClick={() => onLogin()} 
            className="nav-link"
            style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' }}
          >
            Login
          </button>
          <button 
            onClick={() => onGetStarted()} 
            className="btn-accent" 
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.95rem' }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container" style={{ 
        paddingTop: '8rem', 
        paddingBottom: '8rem', 
        textAlign: 'center', 
        position: 'relative',
        zIndex: 1 
      }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          background: 'rgba(249,115,22,0.1)', 
          padding: '0.5rem 1rem', 
          borderRadius: '20px', 
          marginBottom: '2rem',
          border: '1px solid rgba(249,115,22,0.3)'
        }}>
          <Zap size={16} color="#F97316" />
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#F97316', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Next-Gen Logistics Platform
          </span>
        </div>

        <h1 style={{ 
          fontSize: '4.5rem', 
          fontWeight: '800', 
          lineHeight: '1.1', 
          marginBottom: '1.5rem',
          background: 'linear-gradient(to right, #FFFFFF, #94A3B8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Logistics <span style={{ color: '#F97316', WebkitTextFillColor: '#F97316' }}>Wired</span> for Speed.
        </h1>
        
        <p style={{ 
          fontSize: '1.25rem', 
          color: '#94A3B8', 
          maxWidth: '700px', 
          margin: '0 auto 3rem',
          lineHeight: '1.6'
        }}>
          Manage, track, and deliver with pinpoint precision. A 3-role ecosystem designed 
          for dispatchers, couriers, and customers to move the world, faster.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={onGetStarted}
            className="btn-accent" 
            style={{ 
              padding: '1rem 2rem', 
              fontSize: '1.1rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.4)'
            }}
          >
            Launch Platform <ArrowRight size={20} />
          </button>
        </div>
      </header>

      {/* Role Sections */}
      <section style={{ background: '#1E293B', padding: '6rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem' }}>One Platform. Three Perspectives.</h2>
            <p style={{ color: '#94A3B8' }}>Seamlessly connected workflows for every stage of the journey.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {/* Dispatcher Card */}
            <div className="card hover-card" style={{ background: '#0F172A', border: '1px solid #334155', cursor: 'pointer' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <UserCheck size={24} color="#3B82F6" />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>For Dispatchers</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Full visibility of the city network. Create shipments, assign routes, and manage drivers from a unified command center.
              </p>
            </div>

            {/* Courier Card */}
            <div className="card hover-card" style={{ background: '#0F172A', border: '1px solid #334155', cursor: 'pointer' }}>
              <div style={{ background: 'rgba(249, 115, 22, 0.1)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Truck size={24} color="#F97316" />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>For Couriers</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Wired for productivity. Receive instant assignments, navigate with real-time tracking, and update status with one tap.
              </p>
            </div>

            {/* Customer Card */}
            <div className="card hover-card" style={{ background: '#0F172A', border: '1px solid #334155', cursor: 'pointer' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Search size={24} color="#10B981" />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>For Customers</h3>
              <p style={{ color: '#94A3B8', fontSize: '0.95rem', lineHeight: '1.6' }}>
                Zero anxiety. Track your packages on a visual timeline and receive live notifications as they move through the city.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '4rem 0', borderTop: '1px solid #334155', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Truck size={24} color="#F97316" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>ShipWise</h2>
        </div>
        <p style={{ color: '#64748B', fontSize: '0.8rem' }}>&copy; 2026 ShipWise Logistics Platform. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Landing;
