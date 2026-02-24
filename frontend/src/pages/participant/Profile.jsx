import { useState, useEffect } from 'react';
import { participantAPI, authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiUser, FiSave, FiPhone, FiMail, FiHeart, FiLock, FiBookOpen } from 'react-icons/fi';
import './Participant.css';

const AVAILABLE_INTERESTS = [
  'Technology', 'Music', 'Dance', 'Art', 'Literature',
  'Sports', 'Gaming', 'Photography', 'Film', 'Coding',
  'Robotics', 'Debate', 'Quizzing', 'Entrepreneurship', 'Design',
];

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    collegeName: '',
    contactNumber: '',
    interests: [],
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await participantAPI.getProfile();
      const data = res.data.data;
      setProfile(data);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        collegeName: data.collegeName || '',
        contactNumber: data.contactNumber || '',
        interests: data.interests || [],
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
      await participantAPI.updateProfile(formData);
      toast.success('Profile updated successfully!');
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setChangingPassword(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setShowPasswordSection(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const toggleInterest = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1><FiUser /> My Profile</h1>
      </div>

      <div className="profile-card">
        <div className="profile-info-header">
          <div className="profile-avatar">
            {formData.firstName?.charAt(0)?.toUpperCase()}
            {formData.lastName?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2>{formData.firstName} {formData.lastName}</h2>
            <p className="profile-email"><FiMail /> {user?.email}</p>
            <span className="profile-type-badge">{profile?.participantType || 'Participant'}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>College Name</label>
            <input
              type="text"
              value={formData.collegeName}
              onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label><FiPhone /> Contact Number</label>
            <input
              type="tel"
              value={formData.contactNumber}
              onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              maxLength={10}
            />
          </div>

          <div className="form-group">
            <label><FiBookOpen /> Areas of Interest</label>
            <div className="interest-grid profile-interests">
              {AVAILABLE_INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  className={`interest-chip ${formData.interests.includes(interest) ? 'selected' : ''}`}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={saving}>
            <FiSave />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </form>
      </div>

      {/* Followed Clubs */}
      {profile?.followedClubs?.length > 0 && (
        <div className="profile-card" style={{ marginTop: '1.5rem' }}>
          <h3><FiHeart /> Followed Clubs ({profile.followedClubs.length})</h3>
          <div className="followed-clubs-list">
            {profile.followedClubs.map((club) => (
              <div key={club._id} className="followed-club-item">
                <strong>{club.organizerName}</strong>
                <span className="type-chip">{club.category}</span>
                {club.description && <p className="club-description">{club.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Password Change */}
      <div className="profile-card" style={{ marginTop: '1.5rem' }}>
        <button
          type="button"
          className="password-toggle-btn"
          onClick={() => setShowPasswordSection(!showPasswordSection)}
        >
          <FiLock /> {showPasswordSection ? 'Cancel Password Change' : 'Change Password'}
        </button>

        {showPasswordSection && (
          <form onSubmit={handlePasswordChange} className="profile-form" style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="Enter current password"
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="Min 6 characters"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmNewPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                placeholder="Re-enter new password"
                required
              />
            </div>
            <button type="submit" className="auth-btn" disabled={changingPassword}>
              <FiLock />
              <span>{changingPassword ? 'Changing...' : 'Update Password'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
