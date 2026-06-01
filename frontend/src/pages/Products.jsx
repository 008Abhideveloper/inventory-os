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
    <div className="animation-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="text-muted mt-2">Manage your inventory catalog</p>
        </div>
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
              <th>Product</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="flex" style={{ alignItems: 'center', gap: '1rem' }}>
                    <div className="avatar" style={{ width: '36px', height: '36px', fontSize: '0.9rem' }}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500 }}>{p.name}</span>
                  </div>
                </td>
                <td><span className="text-muted">{p.sku}</span></td>
                <td style={{ fontWeight: 500 }}>${p.price.toFixed(2)}</td>
                <td>
                  {p.quantity > 10 ? (
                    <span className="badge badge-success">In Stock ({p.quantity})</span>
                  ) : p.quantity > 0 ? (
                    <span className="badge badge-warning">Low Stock ({p.quantity})</span>
                  ) : (
                    <span className="badge badge-danger">Out of Stock</span>
                  )}
                </td>
                <td>
                  <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                    <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', color: 'var(--info-color)' }} onClick={() => handleEdit(p)}>
                      <FiEdit2 size={16} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', color: 'var(--danger-color)' }} onClick={() => handleDelete(p.id)}>
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-muted" style={{ padding: '4rem 2rem' }}>
                  <div className="flex-center" style={{ flexDirection: 'column', gap: '1rem' }}>
                    <FiBox size={48} style={{ opacity: 0.3 }} />
                    <h3 style={{ color: 'var(--text-main)' }}>No products found</h3>
                    <p>Get started by adding your first product.</p>
                    <button className="btn btn-primary mt-4" onClick={() => setShowModal(true)}>
                      <FiPlus /> Add Product
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
              <h2 className="modal-title">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            {error && <div className="badge badge-danger mb-4 w-full flex-center p-3">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g. Wireless Headphones"
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
                  placeholder="e.g. WH-100"
                />
              </div>
              <div className="flex gap-4 mb-2">
                <div className="form-group w-full">
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
                <div className="form-group w-full">
                  <label className="form-label">Initial Stock</label>
                  <input 
                    type="number" 
                    min="0"
                    className="form-control" 
                    value={formData.quantity} 
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                    required
                  />
                </div>
              </div>
              <div className="flex-between mt-6">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.625rem 2rem' }}>{editingId ? 'Save Changes' : 'Create Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
