import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { participantAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EventCard from '../../components/common/EventCard';
import GlowingCards from '../../components/common/GlowingCards';
import { toast } from 'react-toastify';
import { FiMail, FiHeart, FiArrowLeft, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import './Participant.css';

const OrganizerDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [organizer, setOrganizer] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    fetchOrganizerDetail();
    fetchFollowStatus();
  }, [id]);

  const fetchOrganizerDetail = async () => {
    try {
      const res = await participantAPI.getOrganizerDetail(id);
      const data = res.data.data;
      setOrganizer(data.organizer);
      setUpcomingEvents(data.upcomingEvents || []);
      setPastEvents(data.pastEvents || []);
    } catch (error) {
      toast.error('Failed to load organizer details');
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowStatus = async () => {
    try {
      const res = await participantAPI.getProfile();
      const followedIds = res.data.data?.followedClubs?.map((c) => c._id || c) || [];
      setIsFollowing(followedIds.includes(id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleFollow = async () => {
    try {
      const res = await participantAPI.toggleFollow(id);
      toast.success(res.data.message);
      setIsFollowing(!isFollowing);
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!organizer) return <div className="page-container"><p>Organizer not found.</p></div>;

  const events = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <div className="page-container">
      <Link to="/participant/organizers" className="back-link">
        <FiArrowLeft /> Back to Clubs
      </Link>

      <div className="organizer-detail-header">
        <div className="org-detail-avatar">
          {organizer.organizerName?.charAt(0)?.toUpperCase()}
        </div>
        <div className="org-detail-info">
          <h1>{organizer.organizerName}</h1>
          <span className="org-category-badge">{organizer.category}</span>
          {organizer.description && <p className="org-detail-desc">{organizer.description}</p>}
          {organizer.contactEmail && (
            <p className="org-contact">
              <FiMail /> {organizer.contactEmail}
            </p>
          )}
        </div>
        <button
          className={`follow-btn large ${isFollowing ? 'following' : ''}`}
          onClick={handleToggleFollow}
        >
          <FiHeart />
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>

      <div className="org-events-section">
        <div className="org-events-tabs">
          <button
            className={`tab-btn ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            <FiCalendar /> Upcoming ({upcomingEvents.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'past' ? 'active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past ({pastEvents.length})
          </button>
        </div>

        {events.length === 0 ? (
          <div className="empty-state">
            <p>No {activeTab} events</p>
          </div>
        ) : (
          <GlowingCards className="events-grid">
            {events.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </GlowingCards>
        )}
      </div>
    </div>
  );
};

export default OrganizerDetail;
