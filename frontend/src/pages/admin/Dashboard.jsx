import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import GlowingCards from '../../components/common/GlowingCards';
import TextScramble from '../../components/common/TextScramble';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiUsers, FiKey, FiShield } from 'react-icons/fi';
import './Admin.css';

const AdminDashboard = () => {
  const [organizers, setOrganizers] = useState([]);
  const [resetRequests, setResetRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [orgsRes, resetsRes] = await Promise.all([
        adminAPI.getAllOrganizers(),
        adminAPI.getPasswordResetRequests(),
      ]);
      setOrganizers(orgsRes.data.data || []);
      setResetRequests(resetsRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const pendingResets = resetRequests.filter((r) => r.status === 'PENDING');
  const activeOrgs = organizers.filter((o) => o.userId?.isActive);

  return (
    <div className="page-container">
      <div className="page-header">
        <TextScramble text="Admin Dashboard" as="h1" speed={20}>
          <FiShield style={{ marginRight: '0.5rem' }} />
        </TextScramble>
        <p>Manage organizers and system settings</p>
      </div>

      <GlowingCards className="stats-grid">
        <div className="stat-card glow-card">
          <FiUsers className="stat-icon" />
          <div>
            <h3>{organizers.length}</h3>
            <p>Total Organizers</p>
          </div>
        </div>
        <div className="stat-card glow-card">
          <FiUsers className="stat-icon" />
          <div>
            <h3>{activeOrgs.length}</h3>
            <p>Active Organizers</p>
          </div>
        </div>
        <div className="stat-card glow-card">
          <FiKey className="stat-icon" />
          <div>
            <h3>{pendingResets.length}</h3>
            <p>Pending Resets</p>
          </div>
        </div>
      </GlowingCards>

      <GlowingCards className="admin-quick-actions">
        <Link to="/admin/organizers" className="quick-action-card glow-card">
          <FiUsers />
          <h3>Manage Organizers</h3>
          <p>Create, approve, and manage organizer accounts</p>
        </Link>
        <Link to="/admin/password-resets" className="quick-action-card glow-card">
          <FiKey />
          <h3>Password Resets</h3>
          <p>{pendingResets.length} pending request{pendingResets.length !== 1 ? 's' : ''}</p>
        </Link>
      </GlowingCards>
    </div>
  );
};

export default AdminDashboard;
