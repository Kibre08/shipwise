import React, { useState } from 'react';
import { User, Mail, Lock, UserPlus, ArrowLeft, Briefcase, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const Register = ({ onRegisterSuccess, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/auth/register', formData, {
        withCredentials: true
      });
      sessionStorage.setItem('activeTabRole', res.data.user.role);
      onRegisterSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        <ArrowLeft size={20} /> Back
      </button>

      <div className="card" style={{ width: '100%', maxWidth: '450px', background: '#1E293B', border: '1px solid #334155' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '60px', height: '60px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <UserPlus size={32} color="#10B981" />
          </div>
          <h2 style={{ color: 'white', fontSize: '1.75rem', fontWeight: '700' }}>Create Account</h2>
          <p style={{ color: '#94A3B8' }}>Join the ShipWise logistics network.</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
          <div>
            <label style={{ color: '#E2E8F0', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input 
                type="text" 
                required
                placeholder="John Doe"
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: 'white' }}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

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
            <label style={{ color: '#E2E8F0', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Select Role</label>
            <div style={{ position: 'relative' }}>
              <Briefcase size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <select 
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 3rem', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: 'white', appearance: 'none' }}
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
              >
                <option value="customer">Customer (Recipient)</option>
                <option value="courier">Courier (Driver)</option>
                <option value="dispatcher">Dispatcher (Manager)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ color: '#E2E8F0', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input 
                type={showPassword ? "text" : "password"} 
                required
                minLength="6"
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
            style={{ padding: '1rem', fontSize: '1rem', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#10B981', boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)' }}
          >
            {loading ? 'Creating Account...' : <><UserPlus size={20} /> Create Account</>}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>
            Already have an account? <button onClick={onBack} className="nav-link" style={{ background: 'transparent', border: 'none', color: '#10B981', padding: 0, cursor: 'pointer', outline: 'none' }}>Log In</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
