import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Signup = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      await api.post('/auth/signup', formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed.');
    }
  };

  if (success) {
    return (
      <div style={{ width: '100%', maxWidth: '400px', padding: '2rem', background: 'var(--card-bg)', borderRadius: '8px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--success-color)' }}>Signup Successful!</h2>
        <p>Redirecting to login page...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '400px', padding: '2rem', background: 'var(--card-bg)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h1 className="mb-6" style={{ textAlign: 'center' }}>Create Account</h1>
      {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Username</label>
          <input 
            type="text" 
            className="form-control" 
            value={formData.username} 
            onChange={(e) => setFormData({...formData, username: e.target.value})}
            required
            minLength={3}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input 
            type="email" 
            className="form-control" 
            value={formData.email} 
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <input 
            type="password" 
            className="form-control" 
            value={formData.password} 
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
            minLength={6}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>Sign Up</button>
      </form>
      
      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)' }}>Login</Link>
      </div>
    </div>
  );
};

export default Signup;
