import { useState, useEffect } from 'react';
import api from '../api';
import { FiPlus, FiTrash2, FiEye } from 'react-icons/fi';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [formData, setFormData] = useState({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [ordersRes, customersRes, productsRes] = await Promise.all([
        api.get('/orders'),
        api.get('/customers'),
        api.get('/products')
      ]);
      setOrders(ordersRes.data);
      setCustomers(customersRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: '', quantity: 1 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.customer_id) {
      setError('Please select a customer');
      return;
    }
    
    const processedItems = formData.items
      .filter(item => item.product_id && item.quantity > 0)
      .map(item => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity)
      }));

    if (processedItems.length === 0) {
      setError('Please add at least one valid product');
      return;
    }

    try {
      await api.post('/orders', {
        customer_id: parseInt(formData.customer_id),
        items: processedItems
      });
      setShowModal(false);
      setFormData({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to cancel/delete this order? Inventory will be restored.')) {
      try {
        await api.delete(`/orders/${id}`);
        fetchData();
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to delete');
      }
    }
  };

  const viewOrder = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const getCustomerName = (id) => {
    const customer = customers.find(c => c.id === id);
    return customer ? customer.full_name : 'Unknown';
  };

  const getProductName = (id) => {
    const product = products.find(p => p.id === id);
    return product ? product.name : 'Unknown';
  };

  return (
    <div>
      <div className="flex-between mb-6">
        <h1>Orders</h1>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setFormData({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });
            setShowModal(true);
          }}
        >
          <FiPlus /> Create Order
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>#{o.id}</td>
                <td>{getCustomerName(o.customer_id)}</td>
                <td>${o.total_amount.toFixed(2)}</td>
                <td>{new Date(o.created_at).toLocaleString()}</td>
                <td>
                  <div className="flex gap-2" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }} onClick={() => viewOrder(o)}>
                      <FiEye size={14} />
                    </button>
                    <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(o.id)}>
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No orders found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Order Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Create Order</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            {error && <div style={{ color: 'var(--danger-color)', marginBottom: '1rem' }}>{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Customer</label>
                <select 
                  className="form-control"
                  value={formData.customer_id}
                  onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <div className="flex-between mb-2">
                  <label className="form-label" style={{ marginBottom: 0 }}>Order Items</label>
                  <button type="button" className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={handleAddItem}>
                    + Add Item
                  </button>
                </div>
                
                {formData.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <select 
                      className="form-control"
                      value={item.product_id}
                      onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                      required
                      style={{ flex: 2 }}
                    >
                      <option value="">Select a product</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                          {p.name} - ${p.price} ({p.quantity} in stock)
                        </option>
                      ))}
                    </select>
                    
                    <input 
                      type="number" 
                      className="form-control"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      min="1"
                      required
                      style={{ flex: 1 }}
                    />
                    
                    {formData.items.length > 1 && (
                      <button 
                        type="button" 
                        className="btn btn-danger" 
                        onClick={() => handleRemoveItem(index)}
                        style={{ padding: '0 0.75rem' }}
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex-between mt-4">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Order #{selectedOrder.id} Details</h2>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>&times;</button>
            </div>
            
            <div className="mb-4">
              <p><strong>Customer:</strong> {getCustomerName(selectedOrder.customer_id)}</p>
              <p><strong>Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
              <p><strong>Total Amount:</strong> ${selectedOrder.total_amount.toFixed(2)}</p>
            </div>
            
            <h3 className="mb-2" style={{ fontSize: '1rem' }}>Items:</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map(item => (
                    <tr key={item.id}>
                      <td>{getProductName(item.product_id)}</td>
                      <td>${item.price_at_time.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>${(item.price_at_time * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 text-right" style={{ textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
