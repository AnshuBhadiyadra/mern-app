import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiX, FiLogOut, FiUser, FiHome, FiCalendar, FiUsers, FiSettings, FiActivity } from 'react-icons/fi';
import { useState } from 'react';
import { FelicityLogo } from './SvgIcons';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isParticipant, isOrganizer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (isParticipant) {
      return [
        { to: '/participant/dashboard', label: 'Dashboard', icon: <FiHome /> },
        { to: '/participant/events', label: 'Browse Events', icon: <FiCalendar /> },
        { to: '/participant/registrations', label: 'My Registrations', icon: <FiUsers /> },
        { to: '/participant/organizers', label: 'Clubs', icon: <FiUsers /> },
        { to: '/participant/profile', label: 'Profile', icon: <FiUser /> },
      ];
    }
    if (isOrganizer) {
      return [
        { to: '/organizer/dashboard', label: 'Dashboard', icon: <FiHome /> },
        { to: '/organizer/events/create', label: 'Create Event', icon: <FiCalendar /> },
        { to: '/organizer/dashboard?filter=ongoing', label: 'Ongoing Events', icon: <FiActivity /> },
        { to: '/organizer/profile', label: 'Profile', icon: <FiUser /> },
      ];
    }
    if (isAdmin) {
      return [
        { to: '/admin/dashboard', label: 'Dashboard', icon: <FiHome /> },
        { to: '/admin/organizers', label: 'Organizers', icon: <FiUsers /> },
        { to: '/admin/password-resets', label: 'Password Resets', icon: <FiSettings /> },
      ];
    }
    return [];
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <FelicityLogo size={28} className="brand-icon" />
          <span className="brand-text">Felicity</span>
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className={`navbar-links ${menuOpen ? 'active' : ''}`}>
          {getNavLinks().map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}

          {user && (
            <div className="nav-user-section">
              <span className="nav-user-role">{user.role}</span>
              <button className="nav-logout-btn" onClick={handleLogout}>
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
