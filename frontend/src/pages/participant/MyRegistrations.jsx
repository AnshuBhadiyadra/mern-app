import { useState, useEffect } from 'react';
import { registrationAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { FiUpload, FiDownload } from 'react-icons/fi';
import { TicketIcon, CheckCircleIcon } from '../../components/common/SvgIcons';
import './Participant.css';

const MyRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [expandedTicket, setExpandedTicket] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const res = await registrationAPI.getMyRegistrations();
      setRegistrations(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async (registrationId, file) => {
    if (!file) return;
    setUploadingId(registrationId);
    try {
      const formData = new FormData();
      formData.append('paymentProof', file);
      await registrationAPI.uploadPaymentProof(registrationId, formData);
      toast.success('Payment proof uploaded successfully!');
      fetchRegistrations();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploadingId(null);
    }
  };

  const filteredRegs = registrations.filter((reg) => {
    if (filter === 'all') return true;
    if (filter === 'normal') return reg.registrationType === 'NORMAL';
    if (filter === 'merchandise') return reg.registrationType === 'MERCHANDISE';
    if (filter === 'completed') return reg.status === 'CONFIRMED' && reg.attended;
    if (filter === 'cancelled') return reg.status === 'CANCELLED' || reg.status === 'REJECTED' || reg.paymentStatus === 'REJECTED';
    return true;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Registrations</h1>
        <p>Track your event registrations and tickets</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {[
          { key: 'all', label: 'All' },
          { key: 'normal', label: 'Normal' },
          { key: 'merchandise', label: 'Merchandise' },
          { key: 'completed', label: 'Completed' },
          { key: 'cancelled', label: 'Cancelled / Rejected' },
        ].map((f) => (
          <button
            key={f.key}
            className={`filter-tab ${filter === f.key ? 'active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filteredRegs.length === 0 ? (
        <div className="empty-state">
          <p>No registrations found</p>
        </div>
      ) : (
        <div className="registrations-list">
          {filteredRegs.map((reg) => (
            <div key={reg._id} className="registration-card">
              <div className="reg-card-header">
                <h3>{reg.event?.eventName || 'Unknown Event'}</h3>
                <div className="reg-badges">
                  <span className={`status-badge status-${reg.status.toLowerCase()}`}>
                    {reg.status}
                  </span>
                  {reg.paymentStatus && reg.paymentStatus !== 'NOT_REQUIRED' && (
                    <span className={`status-badge payment-${reg.paymentStatus.toLowerCase()}`}>
                      Payment: {reg.paymentStatus}
                    </span>
                  )}
                </div>
              </div>

              <div className="reg-card-body">
                <div className="reg-info-row">
                  <span>Type: {reg.registrationType}</span>
                  <span>Organizer: {reg.event?.organizer?.organizerName || '—'}</span>
                  <span>Date: {format(new Date(reg.createdAt), 'MMM dd, yyyy')}</span>
                </div>

                {reg.ticketId && (
                  <div className="ticket-section">
                    <button
                      className={`ticket-id-btn ${expandedTicket === reg._id ? 'expanded' : ''}`}
                      onClick={() => setExpandedTicket(expandedTicket === reg._id ? null : reg._id)}
                    >
                      <TicketIcon size={16} /> {reg.ticketId}
                    </button>
                    {expandedTicket === reg._id && (
                      <div className="ticket-expanded">
                        <div className="ticket-detail-row">
                          <strong>Event:</strong> <span>{reg.event?.eventName || '—'}</span>
                        </div>
                        <div className="ticket-detail-row">
                          <strong>Type:</strong> <span>{reg.registrationType}</span>
                        </div>
                        <div className="ticket-detail-row">
                          <strong>Status:</strong> <span>{reg.status}</span>
                        </div>
                        <div className="ticket-detail-row">
                          <strong>Organizer:</strong> <span>{reg.event?.organizer?.organizerName || '—'}</span>
                        </div>
                        {reg.qrCode && (
                          <div className="ticket-qr-inline">
                            <img src={reg.qrCode} alt="QR Code" className="qr-image" />
                            <p>Present this QR code at the event venue</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {reg.qrCode && expandedTicket !== reg._id && (
                  <div className="qr-section">
                    <img src={reg.qrCode} alt="QR Code" className="qr-image" />
                  </div>
                )}

                {/* Merchandise Details */}
                {reg.merchandiseDetails?.itemName && (
                  <div className="merch-details">
                    <h4>Item Ordered:</h4>
                    <div className="merch-detail-item">
                      <span>{reg.merchandiseDetails.itemName} × {reg.merchandiseDetails.quantity || 1}</span>
                      <span>₹{reg.merchandiseDetails.totalPrice || 0}</span>
                    </div>
                    {reg.merchandiseDetails.size && <p>Size: {reg.merchandiseDetails.size}</p>}
                    {reg.merchandiseDetails.color && <p>Color: {reg.merchandiseDetails.color}</p>}
                  </div>
                )}

                {/* Upload Payment Proof */}
                {reg.paymentStatus === 'PENDING' && !reg.paymentProof && (
                  <div className="upload-section">
                    <label className="upload-btn">
                      <FiUpload />
                      {uploadingId === reg._id ? 'Uploading...' : 'Upload Payment Proof'}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => handleUploadProof(reg._id, e.target.files[0])}
                        disabled={uploadingId === reg._id}
                      />
                    </label>
                  </div>
                )}

                {reg.paymentProof && (
                  <p className="proof-uploaded"><CheckCircleIcon size={16} /> Payment proof uploaded</p>
                )}

                {reg.paymentStatus === 'REJECTED' && reg.rejectionReason && (
                  <div className="rejection-notice">
                    <strong>Rejection Reason:</strong> {reg.rejectionReason}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRegistrations;
