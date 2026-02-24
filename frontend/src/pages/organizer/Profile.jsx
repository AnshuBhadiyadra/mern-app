import { useState, useEffect } from 'react';
import { organizerAPI, authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiUser, FiSave, FiKey, FiMail } from 'react-icons/fi';
import './Organizer.css';

const OrganizerProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    contactEmail: '',
    contactNumber: '',
    discordWebhook: '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [resetForm, setResetForm] = useState({ reason: '' });
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await organizerAPI.getProfile();
      const data = res.data.data;
      setProfile(data);
      setFormData({
        description: data.description || '',
        contactEmail: data.contactEmail || '',
        contactNumber: data.contactNumber || '',
        discordWebhook: data.discordWebhook || '',
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await organizerAPI.updateProfile(formData);
      toast.success('Profile updated!');
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      await authAPI.changePassword(passwordForm);
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    try {
      await organizerAPI.requestPasswordReset({ reason: resetForm.reason });
      toast.success('Password reset request sent to admin');
      setResetForm({ reason: '' });
      setShowPasswordReset(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to request reset');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><FiUser /> Organizer Profile</h1>
      </div>

      <div className="profile-card">
        <div className="profile-info-header">
          <div className="profile-avatar org-avatar-large">
            {profile?.organizerName?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2>{profile?.organizerName}</h2>
            <p className="profile-email"><FiMail /> {user?.email}</p>
            <span className="org-category-badge">{profile?.category}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              maxLength={1000}
              placeholder="Tell participants about your club..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                maxLength={10}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Discord Webhook URL</label>
            <input
              type="url"
              value={formData.discordWebhook}
              onChange={(e) => setFormData({ ...formData, discordWebhook: e.target.value })}
              placeholder="https://discord.com/api/webhooks/..."
            />
            <small className="form-hint">Used to post event announcements to your Discord server</small>
          </div>

          <button type="submit" className="auth-btn" disabled={saving}>
            <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {/* Change Password */}
        <div className="password-section">
          <h3><FiKey /> Change Password</h3>
          <form onSubmit={handleChangePassword} className="password-form">
            <div className="form-row">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>
            <button type="submit" className="auth-btn secondary">Change Password</button>
          </form>

          <div className="reset-request-section">
            <p>Forgot your password?{' '}
              <button className="text-btn" onClick={() => setShowPasswordReset(!showPasswordReset)}>
                Request admin reset
              </button>
            </p>
            {showPasswordReset && (
              <form onSubmit={handleRequestReset} className="reset-form">
                <div className="form-group">
                  <label>Reason for Reset</label>
                  <textarea
                    value={resetForm.reason}
                    onChange={(e) => setResetForm({ reason: e.target.value })}
                    placeholder="Explain why you need a password reset..."
                    rows={2}
                    required
                  />
                </div>
                <button type="submit" className="auth-btn secondary">Submit Request</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerProfile;
