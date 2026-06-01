import { useState, useEffect } from 'react';
import api from '../api';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', email: '', phone: '' });
  const [error, setError] = useState('');

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/customers', formData);
      setShowModal(false);
      setFormData({ full_name: '', email: '', phone: '' });
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer? All their orders will also be deleted.')) {
      try {
        await api.delete(`/customers/${id}`);
        fetchCustomers();
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to delete');
      }
    }
  };


  return (
    <div className="animation-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="text-muted mt-2">Manage your customer relationships</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setFormData({ full_name: '', email: '', phone: '' });
            setShowModal(true);
          }}
        >
          <FiPlus /> Add Customer
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Phone</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="flex" style={{ alignItems: 'center', gap: '1rem' }}>
                    <div className="avatar">
                      {c.full_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500 }}>{c.full_name}</div>
                      <div className="text-muted" style={{ fontSize: '0.8rem' }}>ID: #{c.id}</div>
                    </div>
                  </div>
                </td>
                <td><span className="text-muted">{c.email}</span></td>
                <td>{c.phone || <span className="text-muted italic">N/A</span>}</td>
                <td>
                  <div className="flex" style={{ justifyContent: 'flex-end' }}>
                    <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', color: 'var(--danger-color)' }} onClick={() => handleDelete(c.id)}>
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-muted" style={{ padding: '4rem 2rem' }}>
                  <div className="flex-center" style={{ flexDirection: 'column', gap: '1rem' }}>
                    <FiUsers size={48} style={{ opacity: 0.3 }} />
                    <h3 style={{ color: 'var(--text-main)' }}>No customers found</h3>
                    <p>Start building your customer base.</p>
                    <button className="btn btn-primary mt-4" onClick={() => setShowModal(true)}>
                      <FiPlus /> Add Customer
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Add New Customer</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            {error && <div className="badge badge-danger mb-4 w-full flex-center p-3">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  placeholder="jane@example.com"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number <span className="text-muted" style={{ fontWeight: 'normal' }}>(Optional)</span></label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="flex-between mt-6">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.625rem 2rem' }}>Create Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
