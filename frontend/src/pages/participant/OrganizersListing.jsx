import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { participantAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiHeart, FiUsers } from 'react-icons/fi';
import './Participant.css';

const OrganizersListing = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchOrganizers();
    fetchProfile();
  }, []);

  const fetchOrganizers = async () => {
    try {
      const res = await participantAPI.getOrganizers();
      setOrganizers(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load clubs');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await participantAPI.getProfile();
      setFollowingIds(res.data.data?.followedClubs?.map((c) => c._id || c) || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleFollow = async (orgId) => {
    try {
      const res = await participantAPI.toggleFollow(orgId);
      toast.success(res.data.message);
      // Update following state
      setFollowingIds((prev) =>
        prev.includes(orgId) ? prev.filter((id) => id !== orgId) : [...prev, orgId]
      );
    } catch (error) {
      toast.error('Failed to update follow status');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><FiUsers /> Clubs & Organizers</h1>
        <p>Discover and follow clubs to stay updated on their events</p>
      </div>

      {organizers.length === 0 ? (
        <div className="empty-state">
          <p>No clubs available yet</p>
        </div>
      ) : (
        <div className="organizers-grid">
          {organizers.map((org) => (
            <div key={org._id} className="organizer-card">
              <div className="org-card-header">
                <div className="org-avatar">
                  {org.organizerName?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h3>{org.organizerName}</h3>
                  <span className="org-category">{org.category}</span>
                </div>
              </div>
              {org.description && (
                <p className="org-description">
                  {org.description.substring(0, 100)}
                  {org.description.length > 100 ? '...' : ''}
                </p>
              )}
              <div className="org-card-actions">
                <button
                  className={`follow-btn ${followingIds.includes(org._id) ? 'following' : ''}`}
                  onClick={() => handleToggleFollow(org._id)}
                >
                  <FiHeart />
                  {followingIds.includes(org._id) ? 'Following' : 'Follow'}
                </button>
                <Link to={`/participant/organizers/${org._id}`} className="org-details-link">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizersListing;
