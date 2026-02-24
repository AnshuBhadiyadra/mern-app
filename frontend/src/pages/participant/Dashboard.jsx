import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventAPI, registrationAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import EventCard from '../../components/common/EventCard';
import GlowingCards from '../../components/common/GlowingCards';
import TextScramble from '../../components/common/TextScramble';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiCalendar, FiTrendingUp, FiBookmark } from 'react-icons/fi';
import './Participant.css';

const ParticipantDashboard = () => {
  const { user } = useAuth();
  const [trending, setTrending] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [trendingRes, regsRes] = await Promise.all([
        eventAPI.getTrending(),
        registrationAPI.getMyRegistrations(),
      ]);
      setTrending(trendingRes.data.data || []);
      setRegistrations(regsRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const upcomingRegs = registrations.filter(
    (r) => r.status === 'CONFIRMED' && new Date(r.event?.eventStartDate) > new Date()
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <TextScramble text={`Welcome back, ${user?.firstName || 'Participant'}!`} as="h1" speed={20} />
        <p>Here's what's happening at Felicity</p>
      </div>

      {/* Stats Cards */}
      <GlowingCards className="stats-grid">
        <div className="stat-card glow-card">
          <FiBookmark className="stat-icon" />
          <div>
            <h3>{registrations.length}</h3>
            <p>Total Registrations</p>
          </div>
        </div>
        <div className="stat-card glow-card">
          <FiCalendar className="stat-icon" />
          <div>
            <h3>{upcomingRegs.length}</h3>
            <p>Upcoming Events</p>
          </div>
        </div>
        <div className="stat-card glow-card">
          <FiTrendingUp className="stat-icon" />
          <div>
            <h3>{trending.length}</h3>
            <p>Trending Events</p>
          </div>
        </div>
      </GlowingCards>

      {/* Upcoming Registrations */}
      {upcomingRegs.length > 0 && (
        <section className="dashboard-section">
          <h2>Your Upcoming Events</h2>
          <div className="reg-list">
            {upcomingRegs.slice(0, 3).map((reg) => (
              <div key={reg._id} className="reg-item">
                <div className="reg-item-info">
                  <h4>{reg.event?.eventName}</h4>
                  <p>Ticket: {reg.ticketId || 'Pending'}</p>
                </div>
                <span className={`status-badge status-${reg.status.toLowerCase()}`}>
                  {reg.status}
                </span>
              </div>
            ))}
          </div>
          <Link to="/participant/registrations" className="view-all-link">
            View all registrations →
          </Link>
        </section>
      )}

      {/* Trending Events */}
      <section className="dashboard-section">
        <div className="section-header">
          <h2><FiTrendingUp /> Trending Events</h2>
          <Link to="/participant/events" className="view-all-link">Browse all →</Link>
        </div>
        {trending.length === 0 ? (
          <p className="no-data">No trending events right now</p>
        ) : (
          <GlowingCards className="events-grid">
            {trending.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </GlowingCards>
        )}
      </section>
    </div>
  );
};

export default ParticipantDashboard;
