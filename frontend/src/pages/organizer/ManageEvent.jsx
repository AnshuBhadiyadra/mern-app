import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI, registrationAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import {
  FiUsers, FiCheckCircle, FiXCircle, FiDownload,
  FiSend, FiLock, FiBarChart2, FiSearch
} from 'react-icons/fi';
import { CheckCircleIcon, LightbulbIcon } from '../../components/common/SvgIcons';
import QrScanner from '../../components/common/QrScanner';
import './Organizer.css';

const ManageEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceInput, setAttendanceInput] = useState('');

  useEffect(() => {
    fetchEventData();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'participants') fetchParticipants();
    if (activeTab === 'analytics') fetchAnalytics();
  }, [activeTab]);

  const fetchEventData = async () => {
    try {
      const res = await eventAPI.getEventById(id);
      setEvent(res.data.data);
    } catch (error) {
      toast.error('Event not found');
      navigate('/organizer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const params = searchTerm ? { search: searchTerm } : {};
      const res = await registrationAPI.getEventParticipants(id, params);
      setParticipants(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load participants');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await eventAPI.getEventAnalytics(id);
      setAnalytics(res.data.data);
    } catch (error) {
      console.error('Failed to load analytics');
    }
  };

  const handlePublish = async () => {
    try {
      await eventAPI.publishEvent(id);
      toast.success('Event published successfully!');
      fetchEventData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to publish event');
    }
  };

  const handleCloseEvent = async () => {
    if (!window.confirm('Are you sure you want to close this event?')) return;
    try {
      await eventAPI.closeEvent(id);
      toast.success('Event closed');
      fetchEventData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to close event');
    }
  };

  const handleApprovePayment = async (regId) => {
    try {
      await registrationAPI.approvePayment(regId);
      toast.success('Payment approved!');
      fetchParticipants();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to approve');
    }
  };

  const handleRejectPayment = async (regId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await registrationAPI.rejectPayment(regId, { reason });
      toast.success('Payment rejected');
      fetchParticipants();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject');
    }
  };

  const handleMarkAttendance = async () => {
    if (!attendanceInput.trim()) return;
    try {
      await registrationAPI.markAttendance('scan', {
        ticketId: attendanceInput.trim(),
      });
      toast.success('Attendance marked!');
      setAttendanceInput('');
      fetchParticipants();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to mark attendance');
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await registrationAPI.exportParticipants(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `participants_${event.eventName}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV exported!');
    } catch (error) {
      toast.error('Failed to export CSV');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!event) return <div className="page-container"><p>Event not found</p></div>;

  return (
    <div className="page-container">
      {/* Event Header */}
      <div className="manage-event-header">
        <div>
          <h1>{event.eventName}</h1>
          <div className="manage-event-meta">
            <span className={`status-badge status-${event.status?.toLowerCase()}`}>
              {event.status}
            </span>
            <span className="type-chip">{event.eventType}</span>
            <span>{format(new Date(event.eventStartDate), 'PPP')}</span>
          </div>
        </div>
        <div className="manage-event-actions">
          {event.status === 'DRAFT' && (
            <button className="primary-action-btn" onClick={handlePublish}>
              <FiSend /> Publish
            </button>
          )}
          {(event.status === 'PUBLISHED' || event.status === 'ONGOING') && (
            <button className="danger-btn" onClick={handleCloseEvent}>
              <FiLock /> Close Event
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-nav">
        {['overview', 'participants', 'attendance', 'analytics'].map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="info-grid-2col">
              <div className="info-block">
                <h3>Event Details</h3>
                <p><strong>Description:</strong> {event.description}</p>
                <p><strong>Venue:</strong> {event.venue || 'TBD'}</p>
                <p><strong>Eligibility:</strong> {event.eligibility}</p>
                <p><strong>Fee:</strong> {event.registrationFee > 0 ? `₹${event.registrationFee}` : 'Free'}</p>
              </div>
              <div className="info-block">
                <h3>Registration Stats</h3>
                <p><strong>Registered:</strong> {event.currentRegistrations || 0}</p>
                <p><strong>Limit:</strong> {event.registrationLimit || 'Unlimited'}</p>
                <p><strong>Deadline:</strong> {event.registrationDeadline ? format(new Date(event.registrationDeadline), 'PPP') : 'None'}</p>
              </div>
            </div>
            {event.eventTags?.length > 0 && (
              <div className="event-tags-section">
                <strong>Tags:</strong>
                <div className="tags-list">
                  {event.eventTags.map((tag, i) => (
                    <span key={i} className="event-tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Participants Tab */}
        {activeTab === 'participants' && (
          <div className="participants-section">
            <div className="participants-toolbar">
              <div className="search-form">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search participants..."
                  className="search-input"
                  onKeyDown={(e) => e.key === 'Enter' && fetchParticipants()}
                />
              </div>
              <button className="secondary-btn" onClick={handleExportCSV}>
                <FiDownload /> Export CSV
              </button>
            </div>

            {participants.length === 0 ? (
              <div className="empty-state"><p>No participants yet</p></div>
            ) : (
              <div className="events-table-wrapper">
                <table className="events-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Ticket</th>
                      <th>Attendance</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((reg) => (
                      <tr key={reg._id}>
                        <td>
                          {reg.participant?.firstName} {reg.participant?.lastName}
                        </td>
                        <td>{reg.participant?.userId?.email || '-'}</td>
                        <td>
                          <span className={`status-badge status-${reg.status.toLowerCase()}`}>
                            {reg.status}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge payment-${(reg.paymentStatus || 'na').toLowerCase()}`}>
                            {reg.paymentStatus || 'N/A'}
                          </span>
                        </td>
                        <td>{reg.ticketId || '-'}</td>
                        <td>{reg.attendance?.marked ? <CheckCircleIcon size={16} /> : '—'}</td>
                        <td className="action-cell">
                          {reg.paymentStatus === 'PENDING' && reg.paymentProof && (
                            <>
                              <button
                                className="icon-btn approve"
                                onClick={() => handleApprovePayment(reg._id)}
                                title="Approve Payment"
                              >
                                <FiCheckCircle />
                              </button>
                              <button
                                className="icon-btn reject"
                                onClick={() => handleRejectPayment(reg._id)}
                                title="Reject Payment"
                              >
                                <FiXCircle />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="attendance-section">
            <h3>Mark Attendance</h3>
            <p>Enter ticket ID manually or scan a QR code using your camera</p>
            <div className="attendance-input-group">
              <input
                type="text"
                value={attendanceInput}
                onChange={(e) => setAttendanceInput(e.target.value)}
                placeholder="Enter Ticket ID (e.g., FEL-...)"
                className="attendance-input"
                onKeyDown={(e) => e.key === 'Enter' && handleMarkAttendance()}
              />
              <button className="primary-action-btn" onClick={handleMarkAttendance}>
                <FiCheckCircle /> Mark
              </button>
            </div>
            <div className="qr-scanner-section">
              <h4>Camera QR Scanner</h4>
              <QrScanner
                onScan={(decodedText) => {
                  // QR may contain JSON with ticketId or just the ticketId string
                  let ticketId = decodedText;
                  try {
                    const parsed = JSON.parse(decodedText);
                    if (parsed.ticketId) ticketId = parsed.ticketId;
                  } catch (e) {
                    // plain text ticketId
                  }
                  setAttendanceInput(ticketId);
                  // Auto-mark attendance
                  (async () => {
                    try {
                      await registrationAPI.markAttendance('scan', { ticketId });
                      toast.success(`Attendance marked for ${ticketId}`);
                      fetchParticipants();
                    } catch (error) {
                      toast.error(error.response?.data?.error || 'Failed to mark attendance');
                    }
                  })();
                }}
                onError={() => {}}
              />
            </div>
            <p className="section-hint">
              <LightbulbIcon size={16} /> Point your camera at the participant's QR code for instant attendance marking
            </p>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h3><FiBarChart2 /> Event Analytics</h3>
            {analytics ? (
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h4>Total Registrations</h4>
                  <span className="analytics-number">{analytics.totalRegistrations || 0}</span>
                </div>
                <div className="analytics-card">
                  <h4>Confirmed</h4>
                  <span className="analytics-number">{analytics.confirmedRegistrations || 0}</span>
                </div>
                <div className="analytics-card">
                  <h4>Pending</h4>
                  <span className="analytics-number">{analytics.pendingRegistrations || 0}</span>
                </div>
                <div className="analytics-card">
                  <h4>Attendance</h4>
                  <span className="analytics-number">{analytics.attendanceCount || 0}</span>
                </div>
                {analytics.revenue !== undefined && (
                  <div className="analytics-card">
                    <h4>Revenue</h4>
                    <span className="analytics-number">₹{analytics.revenue || 0}</span>
                  </div>
                )}
              </div>
            ) : (
              <LoadingSpinner message="Loading analytics..." />
            )}
            {/* TODO: Add charts/graphs for visual analytics - a good thing for you to customize! */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageEvent;
