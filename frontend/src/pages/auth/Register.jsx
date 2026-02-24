import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiUser, FiUserPlus, FiPhone, FiBookOpen } from 'react-icons/fi';
import TextScramble from '../../components/common/TextScramble';
import { FelicityLogo, BanyanTree } from '../../components/common/SvgIcons';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    participantType: 'IIIT',
    collegeName: '',
    contactNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.contactNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.participantType === 'NON_IIIT' && !formData.collegeName) {
      toast.error('Please provide your college name');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const registrationData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        participantType: formData.participantType,
        contactNumber: formData.contactNumber,
        collegeName:
          formData.collegeName ||
          (formData.participantType === 'IIIT' ? 'IIIT Hyderabad' : ''),
      };
      await register(registrationData);
      toast.success('Registration successful!');
      navigate('/participant/onboarding');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <FelicityLogo size={48} className="auth-logo" />
          <TextScramble text="Join Felicity" as="h1" speed={25} />
          <p>Create your participant account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">
                <FiUser /> First Name
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">
                <FiUser /> Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <FiMail /> Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
            <small className="form-hint">
              IIIT students: use your @iiit.ac.in email for campus events
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="participantType">
              <FiBookOpen /> Participant Type
            </label>
            <select
              id="participantType"
              name="participantType"
              value={formData.participantType}
              onChange={handleChange}
              required
            >
              <option value="IIIT">IIIT Student</option>
              <option value="NON_IIIT">Non-IIIT Student</option>
            </select>
          </div>

          {formData.participantType === 'NON_IIIT' && (
            <div className="form-group">
              <label htmlFor="collegeName">
                <FiBookOpen /> College Name
              </label>
              <input
                type="text"
                id="collegeName"
                name="collegeName"
                value={formData.collegeName}
                onChange={handleChange}
                placeholder="Your college/university name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="contactNumber">
              <FiPhone /> Contact Number
            </label>
            <input
              type="tel"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Your phone number"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FiLock /> Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <FiLock /> Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter password"
              required
            />
          </div>

          <button type="submit" className="auth-btn" disabled={loading}>
            <FiUserPlus />
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
        <div className="auth-branding">
          <BanyanTree size={32} />
          <span>IIIT Hyderabad</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
