import { useState, useEffect } from 'react';
import api from '../api';
import { FiPlus, FiTrash2, FiEye, FiShoppingCart } from 'react-icons/fi';

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
    <div className="animation-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="text-muted mt-2">Track and manage customer orders</p>
        </div>
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
              <th>Date</th>
              <th>Status</th>
              <th>Total Amount</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>#{o.id}</span>
                </td>
                <td>
                  <div className="flex" style={{ alignItems: 'center', gap: '0.75rem' }}>
                    <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>
                      {getCustomerName(o.customer_id).charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 500 }}>{getCustomerName(o.customer_id)}</span>
                  </div>
                </td>
                <td>
                  <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                    {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </td>
                <td>
                  <span className="badge badge-success">
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor', display: 'inline-block' }}></span>
                    Completed
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>${o.total_amount.toFixed(2)}</td>
                <td>
                  <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                    <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', color: 'var(--primary-color)' }} onClick={() => viewOrder(o)}>
                      <FiEye size={16} />
                    </button>
                    <button className="btn btn-outline" style={{ padding: '0.4rem', border: 'none', color: 'var(--danger-color)' }} onClick={() => handleDelete(o.id)}>
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted" style={{ padding: '4rem 2rem' }}>
                  <div className="flex-center" style={{ flexDirection: 'column', gap: '1rem' }}>
                    <FiShoppingCart size={48} style={{ opacity: 0.3 }} />
                    <h3 style={{ color: 'var(--text-main)' }}>No orders yet</h3>
                    <p>Create your first order to start tracking sales.</p>
                    <button className="btn btn-primary mt-4" onClick={() => setShowModal(true)}>
                      <FiPlus /> Create Order
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Order Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Create New Order</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            {error && <div className="badge badge-danger mb-4 w-full flex-center p-3">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Customer</label>
                <select 
                  className="form-control"
                  value={formData.customer_id}
                  onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                  required
                >
                  <option value="">-- Choose a customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <div className="flex-between mb-4">
                  <label className="form-label" style={{ marginBottom: 0 }}>Order Items</label>
                  <button type="button" className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={handleAddItem}>
                    <FiPlus /> Add Item
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex" style={{ gap: '0.75rem', alignItems: 'center', backgroundColor: 'var(--table-hover-bg)', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <select 
                        className="form-control"
                        value={item.product_id}
                        onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                        required
                        style={{ flex: 2, margin: 0, backgroundColor: 'var(--card-bg)' }}
                      >
                        <option value="">Select a product...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id} disabled={p.quantity === 0}>
                            {p.name} - ${p.price} ({p.quantity} in stock)
                          </option>
                        ))}
                      </select>
                      
                      <div className="flex" style={{ alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                        <span className="text-muted" style={{ fontSize: '0.875rem' }}>Qty:</span>
                        <input 
                          type="number" 
                          className="form-control"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          min="1"
                          required
                          style={{ margin: 0, backgroundColor: 'var(--card-bg)' }}
                        />
                      </div>
                      
                      {formData.items.length > 1 && (
                        <button 
                          type="button" 
                          className="btn btn-outline" 
                          onClick={() => handleRemoveItem(index)}
                          style={{ padding: '0.5rem', border: 'none', color: 'var(--danger-color)' }}
                        >
                          <FiTrash2 />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-between mt-6 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.625rem 2rem' }}>Process Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {showViewModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Invoice #{selectedOrder.id}</h2>
                <div className="text-muted mt-1" style={{ fontSize: '0.875rem' }}>
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </div>
              </div>
              <button className="modal-close" onClick={() => setShowViewModal(false)}>&times;</button>
            </div>
            
            <div className="mb-6 flex" style={{ gap: '2rem', padding: '1.5rem', backgroundColor: 'var(--table-hover-bg)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Billed To</div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{getCustomerName(selectedOrder.customer_id)}</div>
                <div className="text-muted" style={{ fontSize: '0.875rem' }}>Customer ID: #{selectedOrder.customer_id}</div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Status</div>
                <span className="badge badge-success">Paid</span>
              </div>
            </div>
            
            <div className="table-container" style={{ boxShadow: 'none', border: '1px solid var(--border-color)' }}>
              <table>
                <thead>
                  <tr>
                    <th>Item Description</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontWeight: 500 }}>{getProductName(item.product_id)}</td>
                      <td className="text-muted">${item.price_at_time.toFixed(2)}</td>
                      <td className="text-muted">{item.quantity}</td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>${(item.price_at_time * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex mt-6 pt-4" style={{ justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ width: '250px' }}>
                <div className="flex-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span>${selectedOrder.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex-between mb-4">
                  <span className="text-muted">Tax</span>
                  <span>$0.00</span>
                </div>
                <div className="flex-between pt-4" style={{ borderTop: '1px solid var(--border-color)', fontSize: '1.25rem', fontWeight: 700 }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--primary-color)' }}>${selectedOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-right flex gap-4" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => window.print()}>Print Invoice</button>
              <button className="btn btn-primary" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
