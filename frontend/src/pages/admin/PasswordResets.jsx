import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { FiKey, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import './Admin.css';

const PasswordResets = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [resetCreds, setResetCreds] = useState(null);   // persisted banner

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await adminAPI.getPasswordResetRequests();
      setRequests(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load password reset requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await adminAPI.approvePasswordReset(id);
      const data = res.data?.data;
      if (data?.newPassword) {
        setResetCreds({
          name: data.request?.organizer?.organizerName || 'Organizer',
          email: data.request?.organizer?.contactEmail || '',
          password: data.newPassword,
        });
      }
      toast.success('Password reset approved!');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to approve reset');
    }
  };

  const handleReject = async (id) => {
    const comments = prompt('Enter rejection reason:');
    if (comments === null) return;
    try {
      await adminAPI.rejectPasswordReset(id, { adminComments: comments });
      toast.success('Request rejected');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to reject request');
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><FiKey /> Password Reset Requests</h1>
        <p>Manage organizer password reset requests</p>
      </div>

      {/* New Password Banner — persists until dismissed */}
      {resetCreds && (
        <div className="credentials-banner">
          <div className="credentials-banner-header">
            <h3><FiCheckCircle /> Password Reset — New Credentials</h3>
            <button className="credentials-close-btn" onClick={() => setResetCreds(null)} title="Dismiss">&times;</button>
          </div>
          <div className="credentials-body">
            <div className="credential-row">
              <span className="credential-label">Organization</span>
              <span className="credential-value">{resetCreds.name}</span>
            </div>
            <div className="credential-row">
              <span className="credential-label">Email</span>
              <code className="credential-value selectable">{resetCreds.email}</code>
            </div>
            <div className="credential-row">
              <span className="credential-label">New Password</span>
              <code className="credential-value selectable">{resetCreds.password}</code>
            </div>
          </div>
          <p className="credentials-hint">Copy and share this new password with the organizer. This banner stays until you dismiss it.</p>
        </div>
      )}

      <div className="filter-tabs">
        {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((f) => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <div className="empty-state">
          <p>No {filter.toLowerCase()} requests</p>
        </div>
      ) : (
        <div className="reset-requests-list">
          {filteredRequests.map((req) => (
            <div key={req._id} className="reset-request-card">
              <div className="reset-card-header">
                <div>
                  <h3>{req.organizer?.organizerName || 'Unknown Organizer'}</h3>
                  <p className="reset-email">{req.organizer?.userId?.email || '-'}</p>
                </div>
                <span className={`status-badge status-${req.status.toLowerCase()}`}>
                  {req.status}
                </span>
              </div>
              <div className="reset-card-body">
                <p><strong>Reason:</strong> {req.reason}</p>
                <p className="reset-date">
                  Requested: {format(new Date(req.requestedAt), 'PPP p')}
                </p>
                {req.adminComments && (
                  <p><strong>Admin Comments:</strong> {req.adminComments}</p>
                )}
                {req.resolvedAt && (
                  <p className="reset-date">
                    Resolved: {format(new Date(req.resolvedAt), 'PPP p')}
                  </p>
                )}
              </div>
              {req.status === 'PENDING' && (
                <div className="reset-card-actions">
                  <button
                    className="primary-action-btn"
                    onClick={() => handleApprove(req._id)}
                  >
                    <FiCheckCircle /> Approve
                  </button>
                  <button
                    className="danger-btn"
                    onClick={() => handleReject(req._id)}
                  >
                    <FiXCircle /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordResets;
