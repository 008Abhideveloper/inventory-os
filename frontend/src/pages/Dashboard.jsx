import { useState, useEffect } from 'react';
import api from '../api';
import { FiBox, FiUsers, FiShoppingCart, FiAlertCircle } from 'react-icons/fi';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    total_products: 0,
    total_customers: 0,
    total_orders: 0,
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

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1 className="mb-6">Dashboard</h1>
      
      <div className="dashboard-grid">
        <div className="card">
          <div className="flex-between mb-4">
            <h3 className="card-title">Total Products</h3>
            <FiBox size={24} color="var(--primary-color)" />
          </div>
          <div className="card-value">{summary.total_products}</div>
        </div>
        
        <div className="card">
          <div className="flex-between mb-4">
            <h3 className="card-title">Total Customers</h3>
            <FiUsers size={24} color="var(--secondary-color)" />
          </div>
          <div className="card-value">{summary.total_customers}</div>
        </div>
        
        <div className="card">
          <div className="flex-between mb-4">
            <h3 className="card-title">Total Orders</h3>
            <FiShoppingCart size={24} color="var(--warning-color)" />
          </div>
          <div className="card-value">{summary.total_orders}</div>
        </div>
      </div>

      <h2 className="mb-4">Low Stock Alerts</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {summary.low_stock_products.length > 0 ? (
              summary.low_stock_products.map((product) => (
                <tr key={product.id}>
                  <td>{product.id}</td>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td style={{ color: 'var(--danger-color)', fontWeight: 'bold' }}>
                    {product.quantity}
                  </td>
                  <td>
                    <span className="badge badge-warning flex-between" style={{ width: 'fit-content' }}>
                      <FiAlertCircle className="mr-1" /> Low Stock
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>No low stock products</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
