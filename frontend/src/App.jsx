import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DispatcherDashboard from './pages/DispatcherDashboard';
import CourierDashboard from './pages/CourierDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import axios from 'axios';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState(sessionStorage.getItem('sw_current_page') || 'landing');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sessionStorage.setItem('sw_current_page', page);
  }, [page]);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/me', {
          withCredentials: true,
          headers: token ? { 'x-auth-token': token } : {}
        });
        setUser(res.data);
        // If they were on a guest page but are logged in, maybe move to dashboard?
        // But user said "start from landing", so we'll only move if they explicitly login.
        // HOWEVER, if they refresh while on dashboard, page is already 'dashboard' from sessionStorage.
      } catch (err) {
        setUser(null);
        if (page === 'dashboard') setPage('landing');
      } finally {
        setLoading(false);
      }
    };
    
    restoreSession();
  }, []);

  const handleAuthSuccess = (data, switchPage) => {
    if (switchPage) {
      setPage(switchPage);
      return;
    }
    if (data.token) localStorage.setItem('token', data.token);
    setUser(data.user);
    setPage('dashboard');
  };

  const handleLogout = async () => {
    try {
      await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/logout', {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
      setPage('landing');
      localStorage.removeItem('token');
      sessionStorage.clear();
      // Force a hard reload to ensure all memory state is wiped
      window.location.href = '/';
    }
  };

  if (loading) return <div style={{ background: '#0F172A', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Loading ShipWise...</div>;

  if (page === 'landing') return <Landing onGetStarted={() => setPage('login')} />;
  if (page === 'login') return <Login onLoginSuccess={handleAuthSuccess} onBack={() => setPage('landing')} />;
  if (page === 'register') return <Register onRegisterSuccess={handleAuthSuccess} onBack={() => setPage('login')} />;

  return (
    <div className="App">
      <Navbar currentRole={user?.role} setRole={() => {}} onLogout={handleLogout} userName={user?.name} />
      
      <main className="container">
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>
              {user?.role === 'dispatcher' && 'Dispatcher Command Center'}
              {user?.role === 'courier' && 'Courier Delivery Log'}
              {user?.role === 'customer' && 'Track Your Shipment'}
              {!['dispatcher', 'courier', 'customer'].includes(user?.role) && 'Account Role Issue'}
            </h2>
            <p style={{ color: '#64748B' }}>
              Logged in as <strong>{user?.name}</strong> ({user?.role || 'No Role Assigned'})
            </p>
          </div>
          <button onClick={handleLogout} style={{ background: '#334155', color: 'white', fontSize: '0.85rem' }}>Logout</button>
        </header>

        {!['dispatcher', 'courier', 'customer'].includes(user?.role) && (
          <div className="card" style={{ border: '1px solid #EF4444', background: '#FEF2F2', textAlign: 'center', padding: '3rem' }}>
            <h3 style={{ color: '#B91C1C', marginBottom: '1rem' }}>Access Restricted</h3>
            <p style={{ color: '#B91C1C' }}>Your account is currently assigned as a <strong>{user?.role || 'Guest'}</strong>.</p>
            <p style={{ fontSize: '0.9rem', color: '#7F1D1D', marginTop: '1rem' }}>Please log out and sign in with a <strong>Courier</strong> or <strong>Dispatcher</strong> account to access these features.</p>
            <button onClick={handleLogout} style={{ marginTop: '1.5rem', background: '#B91C1C' }}>Switch Account</button>
          </div>
        )}

        {user?.role === 'dispatcher' && <DispatcherDashboard user={user} />}
        {user?.role === 'courier' && <CourierDashboard user={user} />}
        {user?.role === 'customer' && <CustomerDashboard user={user} />}
      </main>
    </div>
  );
}

export default App;
