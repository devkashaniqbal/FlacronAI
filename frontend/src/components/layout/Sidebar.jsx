import { Link, useLocation } from 'react-router-dom';
import {
  FaFileAlt,
  FaChartLine,
  FaCog,
  FaSignOutAlt,
  FaBolt,
  FaCreditCard
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/dashboard', icon: <FaFileAlt />, label: 'Generate Report' },
    { path: '/dashboard?view=reports', icon: <FaChartLine />, label: 'My Reports' },
    { path: '/dashboard?view=billing', icon: <FaCreditCard />, label: 'Usage & Billing' },
    { path: '/dashboard?view=upgrade', icon: <FaBolt />, label: 'Upgrade Plan' },
    { path: '/dashboard?view=settings', icon: <FaCog />, label: 'Settings' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>FLACRON<span>AI</span></h1>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path.split('?')[0] ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="user-details">
            <p className="user-name">{user?.displayName || 'User'}</p>
            <p className="user-email">{user?.email || ''}</p>
          </div>
        </div>
        <button className="btn btn-outline btn-block" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
