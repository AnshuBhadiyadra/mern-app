import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import GlowingCards from '../../components/common/GlowingCards';
import TextScramble from '../../components/common/TextScramble';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { FiPlus, FiCalendar, FiUsers, FiTrendingUp } from 'react-icons/fi';
import './Organizer.css';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await eventAPI.getOrganizerEvents();
      setEvents(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const totalRegs = events.reduce((sum, e) => sum + (e.currentRegistrations || 0), 0);
  const publishedCount = events.filter((e) => e.status === 'PUBLISHED').length;
  const draftCount = events.filter((e) => e.status === 'DRAFT').length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-with-action">
          <div>
            <TextScramble text="Organizer Dashboard" as="h1" speed={20} />
            <p>Manage your events and track registrations</p>
          </div>
          <Link to="/organizer/events/create" className="primary-action-btn">
            <FiPlus /> Create Event
          </Link>
        </div>
      </div>

      {/* Stats */}
      <GlowingCards className="stats-grid">
        <div className="stat-card glow-card">
          <FiCalendar className="stat-icon" />
          <div>
            <h3>{events.length}</h3>
            <p>Total Events</p>
          </div>
        </div>
        <div className="stat-card glow-card">
          <FiUsers className="stat-icon" />
          <div>
            <h3>{totalRegs}</h3>
            <p>Total Registrations</p>
          </div>
        </div>
        <div className="stat-card glow-card">
          <FiTrendingUp className="stat-icon" />
          <div>
            <h3>{publishedCount}</h3>
            <p>Published Events</p>
          </div>
        </div>
      </GlowingCards>

      {/* Events Carousel */}
      <div className="dashboard-section">
        <h2>Your Events</h2>
        {events.length === 0 ? (
          <div className="empty-state">
            <p>No events yet. Create your first event!</p>
            <Link to="/organizer/events/create" className="primary-action-btn">
              <FiPlus /> Create Event
            </Link>
          </div>
        ) : (
          <div className="events-carousel">
            <div className="carousel-track">
              {events.map((event) => (
                <Link
                  key={event._id}
                  to={`/organizer/events/${event._id}`}
                  className="carousel-card glow-card"
                >
                  <div className="carousel-card-header">
                    <span className={`status-badge status-${event.status?.toLowerCase()}`}>
                      {event.status}
                    </span>
                    <span className="type-chip">{event.eventType}</span>
                  </div>
                  <h3 className="carousel-card-title">{event.eventName}</h3>
                  <p className="carousel-card-date">
                    <FiCalendar size={14} /> {format(new Date(event.eventStartDate), 'MMM dd, yyyy')}
                  </p>
                  <div className="carousel-card-stats">
                    <span><FiUsers size={14} /> {event.currentRegistrations || 0}{event.registrationLimit ? `/${event.registrationLimit}` : ''}</span>
                  </div>
                  <span className="carousel-card-link">Manage →</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;
