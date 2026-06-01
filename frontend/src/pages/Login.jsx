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
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="mb-6 text-center" style={{ fontSize: '1.75rem', letterSpacing: '-0.03em' }}>Welcome Back</h1>
        {error && <div className="badge badge-danger mb-4 w-full flex-center p-3">{error}</div>}
        
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
          <button type="submit" className="btn btn-primary w-full mt-4 p-3" style={{ fontSize: '1rem' }}>Sign In</button>
        </form>
        
        <div className="mt-6 text-center text-muted">
          Don't have an account? <Link to="/signup" className="text-success" style={{ fontWeight: 600 }}>Create one</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
