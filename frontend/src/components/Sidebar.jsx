import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { FiHome, FiBox, FiUsers, FiShoppingCart, FiSun, FiMoon, FiLogOut } from 'react-icons/fi';

const Sidebar = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="flex-center" style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', color: 'white', borderRadius: 'var(--radius-md)' }}>
          <FiBox size={24} />
        </div>
        <span>Inventory<span style={{ fontWeight: 300 }}>OS</span></span>
      </div>
      <nav className="sidebar-nav">
        <NavLink 
          to="/" 
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          end
        >
          <FiHome size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink 
          to="/products" 
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          <FiBox size={20} />
          <span>Products</span>
        </NavLink>
        <NavLink 
          to="/customers" 
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          <FiUsers size={20} />
          <span>Customers</span>
        </NavLink>
        <NavLink 
          to="/orders" 
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          <FiShoppingCart size={20} />
          <span>Orders</span>
        </NavLink>
      </nav>
      <div className="theme-toggle-container">
        <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }} onClick={toggleTheme}>
          {theme === 'light' ? (
            <><FiMoon size={18} style={{ marginRight: '0.5rem' }} /> Dark Mode</>
          ) : (
            <><FiSun size={18} style={{ marginRight: '0.5rem' }} /> Light Mode</>
          )}
        </button>
        <button className="btn btn-outline text-danger" style={{ width: '100%', justifyContent: 'center', borderColor: 'transparent', backgroundColor: 'rgba(239, 68, 68, 0.05)' }} onClick={handleLogout}>
          <FiLogOut size={18} style={{ marginRight: '0.5rem' }} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
