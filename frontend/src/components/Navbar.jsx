import React from 'react';
import { Layout, Truck, Package, Search, User } from 'lucide-react';

const Navbar = ({ currentRole, userName, onLogout }) => {
  return (
    <nav style={{ backgroundColor: '#0F172A', color: 'white', padding: '1rem 2rem', borderBottom: '1px solid #1E293B' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0 }}>
        
        {/* LOGO SECTION - ALWAYS VISIBLE */}
        <div 
          onClick={() => window.location.href = '/'} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
        >
          <Truck size={28} color="#F97316" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white', margin: 0, letterSpacing: '-0.5px' }}>ShipWise</h1>
        </div>

        {currentRole && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#94A3B8', fontSize: '0.9rem' }}>
              <User size={18} /> {userName}
            </div>
            <button 
              onClick={onLogout}
              className="nav-link"
              style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#F97316', border: '1px solid rgba(249, 115, 22, 0.3)', fontSize: '0.85rem', cursor: 'pointer', outline: 'none' }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
