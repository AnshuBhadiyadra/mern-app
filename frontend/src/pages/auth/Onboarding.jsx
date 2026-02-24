import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { participantAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiCheck, FiSkipForward } from 'react-icons/fi';
import './Auth.css';

const INTEREST_OPTIONS = [
  'Music', 'Dance', 'Drama', 'Art', 'Photography',
  'Gaming', 'Coding', 'Robotics', 'Quiz', 'Debate',
  'Literature', 'Film', 'Fashion', 'Sports', 'Cooking',
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    participantType: '',
    collegeName: '',
    contactNumber: '',
    interests: [],
  });
  const [organizers, setOrganizers] = useState([]);
  const [selectedClubs, setSelectedClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUser, user } = useAuth();

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    try {
      const res = await participantAPI.getOrganizers();
      setOrganizers(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch organizers:', error);
    }
  };

  const handleInterestToggle = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleClubToggle = (clubId) => {
    setSelectedClubs((prev) =>
      prev.includes(clubId) ? prev.filter((id) => id !== clubId) : [...prev, clubId]
    );
  };

  const handleSkip = async () => {
    try {
      await participantAPI.skipOnboarding();
      updateUser({ ...user, onboardingComplete: true });
      toast.info('Onboarding skipped. You can update your profile later.');
      navigate('/participant/dashboard');
    } catch (error) {
      toast.error('Failed to skip onboarding');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = {
        ...formData,
        followedClubs: selectedClubs,
      };
      await participantAPI.updateOnboarding(data);
      updateUser({ ...user, onboardingComplete: true });
      toast.success('Profile setup complete!');
      navigate('/participant/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card onboarding-card">
        <div className="auth-header">
          <h1>Complete Your Profile</h1>
          <p>Step {step} of 3</p>
          <div className="step-indicator">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`step-dot ${s <= step ? 'active' : ''}`} />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="onboarding-step">
            <h2>Basic Info</h2>
            <div className="form-group">
              <label>Participant Type</label>
              <select
                value={formData.participantType}
                onChange={(e) => setFormData({ ...formData, participantType: e.target.value })}
              >
                <option value="">Select type</option>
                <option value="IIIT">IIIT Student</option>
                <option value="NON_IIIT">External Participant</option>
              </select>
            </div>

            <div className="form-group">
              <label>College Name</label>
              <input
                type="text"
                value={formData.collegeName}
                onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                placeholder="Your college/university"
              />
            </div>

            <div className="form-group">
              <label>Contact Number</label>
              <input
                type="tel"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                placeholder="10-digit mobile number"
                maxLength={10}
              />
            </div>

            <button className="auth-btn" onClick={() => setStep(2)}>
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step">
            <h2>Your Interests</h2>
            <p className="step-description">Select topics you're interested in</p>
            <div className="interest-grid">
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  className={`interest-chip ${formData.interests.includes(interest) ? 'selected' : ''}`}
                  onClick={() => handleInterestToggle(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>
            <div className="step-buttons">
              <button className="auth-btn secondary" onClick={() => setStep(1)}>Back</button>
              <button className="auth-btn" onClick={() => setStep(3)}>Next</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-step">
            <h2>Follow Clubs</h2>
            <p className="step-description">Follow clubs to get updates on their events</p>
            {organizers.length === 0 ? (
              <p className="no-data">No clubs available yet</p>
            ) : (
              <div className="club-list">
                {organizers.map((org) => (
                  <div
                    key={org._id}
                    className={`club-card ${selectedClubs.includes(org._id) ? 'followed' : ''}`}
                    onClick={() => handleClubToggle(org._id)}
                  >
                    <div className="club-info">
                      <h4>{org.organizerName}</h4>
                      <span className="club-category">{org.category}</span>
                    </div>
                    <FiCheck className={`club-check ${selectedClubs.includes(org._id) ? 'visible' : ''}`} />
                  </div>
                ))}
              </div>
            )}
            <div className="step-buttons">
              <button className="auth-btn secondary" onClick={() => setStep(2)}>Back</button>
              <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Saving...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        )}

        <button className="skip-btn" onClick={handleSkip}>
          <FiSkipForward /> Skip for now
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
