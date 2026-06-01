import { useState, useEffect } from 'react';
import api from '../api';
import { FiBox, FiUsers, FiShoppingCart, FiAlertCircle, FiDollarSign } from 'react-icons/fi';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    total_products: 0,
    total_customers: 0,
    total_orders: 0,
    total_revenue: 0,
    low_stock_products: []
  });
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      const response = await api.get('/dashboard-summary');
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) return <div className="flex-center" style={{ height: '50vh' }}><div className="text-muted">Loading dashboard...</div></div>;

  return (
    <div className="animation-fade-in">
      <div className="page-header">
        <h1 className="page-title">Overview</h1>
      </div>
      
      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Total Revenue</h3>
              <div className="card-value">${summary.total_revenue?.toFixed(2) || '0.00'}</div>
            </div>
            <div className="card-icon" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--primary-color)' }}>
              <FiDollarSign />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Total Products</h3>
              <div className="card-value">{summary.total_products}</div>
            </div>
            <div className="card-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--info-color)' }}>
              <FiBox />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Total Customers</h3>
              <div className="card-value">{summary.total_customers}</div>
            </div>
            <div className="card-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning-color)' }}>
              <FiUsers />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Total Orders</h3>
              <div className="card-value">{summary.total_orders}</div>
            </div>
            <div className="card-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
              <FiShoppingCart />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 mb-4 flex-between">
        <h2 style={{ fontSize: '1.25rem' }}>Low Stock Alerts</h2>
      </div>
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {summary.low_stock_products.length > 0 ? (
              summary.low_stock_products.map((product) => (
                <tr key={product.id}>
                  <td><span className="text-muted">#{product.id}</span></td>
                  <td style={{ fontWeight: 500 }}>{product.name}</td>
                  <td><span className="text-muted">{product.sku}</span></td>
                  <td style={{ color: 'var(--danger-color)', fontWeight: 'bold' }}>
                    {product.quantity}
                  </td>
                  <td>
                    <span className="badge badge-warning">
                      <FiAlertCircle size={14} /> Low Stock
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted" style={{ padding: '3rem' }}>
                  <div className="flex-center" style={{ flexDirection: 'column', gap: '1rem' }}>
                    <FiBox size={32} style={{ opacity: 0.5 }} />
                    <span>Inventory levels are healthy. No low stock items.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
