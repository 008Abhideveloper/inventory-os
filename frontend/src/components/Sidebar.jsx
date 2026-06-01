import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiBox, FiUsers, FiShoppingCart, FiSun, FiMoon } from 'react-icons/fi';

const Sidebar = ({ theme, toggleTheme }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <FiBox size={24} />
        <span>InventoryOS</span>
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
            <><FiMoon size={18} /> Dark Mode</>
          ) : (
            <><FiSun size={18} /> Light Mode</>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
