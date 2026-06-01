import { useState, useEffect } from 'react';
import api from '../api';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', sku: '', price: 0, quantity: 0 });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData);
      } else {
        await api.post('/products', formData);
      }
      setShowModal(false);
      setFormData({ name: '', sku: '', price: 0, quantity: 0 });
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    }
  };

  const handleEdit = (product) => {
    setFormData({ name: product.name, sku: product.sku, price: product.price, quantity: product.quantity });
    setEditingId(product.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to delete');
      }
    }
  };

  return (
    <div>
      <div className="flex-between mb-6">
        <h1>Products</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setFormData({ name: '', sku: '', price: 0, quantity: 0 });
            setEditingId(null);
            setShowModal(true);
          }}
        >
          <FiPlus /> Add Product
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.sku}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>{p.quantity}</td>
                <td>
                  <div className="flex gap-2" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleEdit(p)}>
                      <FiEdit2 size={14} />
                    </button>
                    <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(p.id)}>
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No products found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{editingId ? 'Edit Product' : 'Add Product'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">SKU</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.sku} 
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  className="form-control" 
                  value={formData.price} 
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input 
                  type="number" 
                  min="0"
                  className="form-control" 
                  value={formData.quantity} 
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                  required
                />
              </div>
              <div className="flex-between">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
