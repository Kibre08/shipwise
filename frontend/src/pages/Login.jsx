import React, { useState } from 'react';
import { Shield, Mail, Lock, LogIn, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const Login = ({ onLoginSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/login', formData, {
        withCredentials: true
      });
      sessionStorage.setItem('activeTabRole', res.data.user.role);
      onLoginSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <button 
        onClick={onBack}
        style={{ position: 'absolute', top: '2rem', left: '2rem', background: 'transparent', border: 'none', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
      >
        <ArrowLeft size={20} /> Back to Home
      </button>

      <div className="card" style={{ width: '100%', maxWidth: '400px', background: '#1E293B', border: '1px solid #334155' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'rgba(249, 115, 22, 0.1)', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Shield size={32} color="#F97316" />
          </div>
          <h2 style={{ color: 'white', fontSize: '1.75rem', fontWeight: '700' }}>Secure Login</h2>
          <p style={{ color: '#94A3B8' }}>Enter your credentials to access your dashboard.</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <label style={{ color: '#E2E8F0', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input 
                type="email" 
                required
                placeholder="name@company.com"
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ color: '#E2E8F0', fontSize: '0.85rem' }}>Password</label>
              <button 
                type="button" 
                onClick={() => alert("Password reset link has been sent to your email!")} 
                style={{ background: 'transparent', border: 'none', color: '#F97316', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                placeholder="••••••••"
                style={{ width: '100%', padding: '0.75rem 3rem 0.75rem 3rem', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', 
                  right: '1rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'transparent', 
                  border: 'none', 
                  color: '#64748B',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-accent" 
            disabled={loading}
            style={{ padding: '1rem', fontSize: '1rem', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {loading ? 'Authenticating...' : <><LogIn size={20} /> Sign In</>}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid #334155', paddingTop: '1.5rem' }}>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Don't have an account? <button onClick={() => onLoginSuccess(null, 'register')} className="nav-link" style={{ background: 'transparent', border: 'none', color: '#F97316', padding: 0, cursor: 'pointer', outline: 'none' }}>Sign Up</button>
          </p>
          <p style={{ color: '#64748B', fontSize: '0.85rem' }}>
            Testing accounts: <br/> 
            <span style={{ color: '#94A3B8' }}>dispatcher@shipwise.com | courier@shipwise.com</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
