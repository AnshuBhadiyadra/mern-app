import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiPlus, FiCheck, FiTrash2, FiUsers } from 'react-icons/fi';
import { CheckCircleIcon, HourglassIcon } from '../../components/common/SvgIcons';
import './Admin.css';

const ManageOrganizers = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [credentials, setCredentials] = useState(null);   // persisted banner
  const [formData, setFormData] = useState({
    email: '',
    organizerName: '',
    category: 'Technical',
  });

  const CATEGORIES = [
    'Technical', 'Cultural', 'Sports', 'Literary',
    'Arts', 'Music', 'Dance', 'Drama', 'Gaming', 'Social', 'Management', 'Other',
  ];

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      const res = await adminAPI.getAllOrganizers();
      setOrganizers(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load organizers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await adminAPI.createOrganizer(formData);
      const creds = res.data?.data?.credentials;
      if (creds) {
        setCredentials({ name: formData.organizerName, email: creds.email, password: creds.password });
      }
      toast.success('Organizer created successfully!');
      setFormData({ email: '', organizerName: '', category: 'Technical' });
      setShowCreateForm(false);
      fetchOrganizers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create organizer');
    } finally {
      setCreating(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveOrganizer(id);
      toast.success('Organizer approved!');
      fetchOrganizers();
    } catch (error) {
      toast.error('Failed to approve organizer');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this organizer?')) return;
    try {
      await adminAPI.deleteOrganizer(id);
      toast.success('Organizer deactivated');
      fetchOrganizers();
    } catch (error) {
      toast.error('Failed to deactivate organizer');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-with-action">
          <div>
            <h1><FiUsers /> Manage Organizers</h1>
            <p>Create and manage organizer accounts</p>
          </div>
          <button
            className="primary-action-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <FiPlus /> Create Organizer
          </button>
        </div>
      </div>

      {/* Credentials Banner — persists until dismissed */}
      {credentials && (
        <div className="credentials-banner">
          <div className="credentials-banner-header">
            <h3><FiCheck /> Organizer Created — Credentials</h3>
            <button className="credentials-close-btn" onClick={() => setCredentials(null)} title="Dismiss">&times;</button>
          </div>
          <div className="credentials-body">
            <div className="credential-row">
              <span className="credential-label">Organization</span>
              <span className="credential-value">{credentials.name}</span>
            </div>
            <div className="credential-row">
              <span className="credential-label">Login Email</span>
              <code className="credential-value selectable">{credentials.email}</code>
            </div>
            <div className="credential-row">
              <span className="credential-label">Password</span>
              <code className="credential-value selectable">{credentials.password}</code>
            </div>
          </div>
          <p className="credentials-hint">Copy and share these credentials with the organizer. This banner stays until you dismiss it.</p>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <div className="admin-form-card">
          <h3>Create New Organizer</h3>
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="organizer@email.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Organization Name *</label>
                <input
                  type="text"
                  value={formData.organizerName}
                  onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                  placeholder="Club name"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="auth-btn" disabled={creating}>
                {creating ? 'Creating...' : 'Create Organizer'}
              </button>
              <button type="button" className="auth-btn secondary" onClick={() => setShowCreateForm(false)}>
                Cancel
              </button>
            </div>
            <p className="form-hint">
              A random password will be generated and emailed to the organizer.
            </p>
          </form>
        </div>
      )}

      {/* Organizers Table */}
      {organizers.length === 0 ? (
        <div className="empty-state">
          <p>No organizers created yet</p>
        </div>
      ) : (
        <div className="events-table-wrapper">
          <table className="events-table">
            <thead>
              <tr>
                <th>Organization</th>
                <th>Email</th>
                <th>Category</th>
                <th>Status</th>
                <th>Approved</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizers.map((org) => (
                <tr key={org._id}>
                  <td><strong>{org.organizerName}</strong></td>
                  <td>{org.userId?.email || '-'}</td>
                  <td><span className="type-chip">{org.category}</span></td>
                  <td>
                    <span className={`status-badge ${org.userId?.isActive ? 'status-confirmed' : 'status-cancelled'}`}>
                      {org.userId?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{org.isApproved ? <CheckCircleIcon size={18} /> : <HourglassIcon size={18} />}</td>
                  <td className="action-cell">
                    {!org.isApproved && (
                      <button
                        className="icon-btn approve"
                        onClick={() => handleApprove(org._id)}
                        title="Approve"
                      >
                        <FiCheck />
                      </button>
                    )}
                    {org.userId?.isActive && (
                      <button
                        className="icon-btn reject"
                        onClick={() => handleDelete(org._id)}
                        title="Deactivate"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageOrganizers;
