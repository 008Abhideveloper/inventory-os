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
      <div className="auth-container">
        <div className="auth-card text-center">
          <h2 className="text-success mb-4">Signup Successful!</h2>
          <p className="text-muted">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="mb-6 text-center" style={{ fontSize: '1.75rem', letterSpacing: '-0.03em' }}>Create Account</h1>
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
          <button type="submit" className="btn btn-primary w-full mt-4 p-3" style={{ fontSize: '1rem' }}>Sign Up</button>
        </form>
        
        <div className="mt-6 text-center text-muted">
          Already have an account? <Link to="/login" className="text-success" style={{ fontWeight: 600 }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
