import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Create form data for OAuth2
    const form = new URLSearchParams();
    form.append('username', formData.username);
    form.append('password', formData.password);

    try {
      const res = await api.post('/auth/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      localStorage.setItem('token', res.data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '400px', padding: '2rem', background: 'var(--card-bg)', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h1 className="mb-6" style={{ textAlign: 'center' }}>Welcome Back</h1>
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
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.75rem' }}>Login</button>
      </form>
      
      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        Don't have an account? <Link to="/signup" style={{ color: 'var(--primary-color)' }}>Sign up</Link>
      </div>
    </div>
  );
};

export default Login;
