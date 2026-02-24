import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI, registrationAPI, discussionAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { FiCalendar, FiMapPin, FiUsers, FiTag, FiMessageCircle, FiSend, FiCornerUpLeft, FiTrash2 } from 'react-icons/fi';
import { ShoppingBagIcon, ClipboardIcon, PinIcon } from '../../components/common/SvgIcons';
import './Participant.css';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [customFormData, setCustomFormData] = useState({});
  const [merchSelections, setMerchSelections] = useState({});
  const [activeTab, setActiveTab] = useState('details');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyTo, setReplyTo] = useState(null);

  const REACTION_EMOJIS = ['\u{1F44D}', '\u{2764}\u{FE0F}', '\u{1F60A}', '\u{1F525}', '\u{1F389}', '\u{1F914}'];

  useEffect(() => {
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'discussion') {
      fetchMessages();
    }
  }, [activeTab]);

  const fetchEvent = async () => {
    try {
      const res = await eventAPI.getEventById(id);
      setEvent(res.data.data);
    } catch (error) {
      toast.error('Event not found');
      navigate('/participant/events');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await discussionAPI.getMessages(id);
      setMessages(res.data.data || []);
    } catch (error) {
      console.error('Failed to load discussion');
    }
  };

  const handleRegister = async () => {
    setRegistering(true);
    try {
      if (event.eventType === 'MERCHANDISE') {
        const items = Object.entries(merchSelections)
          .filter(([, qty]) => qty > 0)
          .map(([itemId, quantity]) => ({ itemId, quantity: Number(quantity) }));

        if (items.length === 0) {
          toast.error('Please select at least one item');
          setRegistering(false);
          return;
        }

        await registrationAPI.purchaseMerchandise(id, {
          items,
          customFormData: Object.keys(customFormData).length > 0 ? customFormData : undefined,
        });
        toast.success('Purchase request submitted! Upload payment proof to continue.');
      } else {
        await registrationAPI.register(id, {
          customFormData: Object.keys(customFormData).length > 0 ? customFormData : undefined,
        });
        toast.success('Registration successful! Check your email for the ticket.');
      }
      navigate('/participant/registrations');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const payload = { message: newMessage };
      if (replyTo) payload.replyTo = replyTo._id;
      await discussionAPI.postMessage(id, payload);
      setNewMessage('');
      setReplyTo(null);
      fetchMessages();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send message');
    }
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      await discussionAPI.reactToMessage(messageId, { emoji });
      fetchMessages();
    } catch (error) {
      toast.error('Failed to react');
    }
  };

  const handleTogglePin = async (messageId) => {
    try {
      await discussionAPI.togglePin(messageId);
      fetchMessages();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to pin/unpin');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await discussionAPI.deleteMessage(messageId);
      fetchMessages();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete');
    }
  };

  const getReactionCounts = (reactions) => {
    const counts = {};
    (reactions || []).forEach(r => {
      if (!counts[r.emoji]) counts[r.emoji] = { count: 0, userReacted: false };
      counts[r.emoji].count++;
      if (r.userId === user?._id) counts[r.emoji].userReacted = true;
    });
    return counts;
  };

  const getMessageAuthorName = (msg) => {
    if (msg.participant) return `${msg.participant.firstName} ${msg.participant.lastName}`;
    if (msg.organizer?.organizerName) return msg.organizer.organizerName;
    return 'Unknown';
  };

  if (loading) return <LoadingSpinner />;
  if (!event) return <div className="page-container"><p>Event not found</p></div>;

  const isRegistrationOpen = () => {
    if (event.status !== 'PUBLISHED') return false;
    if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) return false;
    if (event.registrationLimit && event.currentRegistrations >= event.registrationLimit) return false;
    return true;
  };

  return (
    <div className="page-container">
      <div className="event-detail">
        {/* Event Header */}
        <div className="event-detail-header">
          <div className="event-detail-badges">
            <span className={`event-status-badge badge-${event.status?.toLowerCase()}`}>
              {event.status}
            </span>
            <span className="event-type-badge">
              {event.eventType === 'MERCHANDISE' ? <><ShoppingBagIcon /> Merchandise</> : <><ClipboardIcon /> Event</>}
            </span>
          </div>
          <h1>{event.eventName}</h1>
          {event.organizer?.organizerName && (
            <p className="event-organizer-name">By {event.organizer.organizerName}</p>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Details
          </button>
          <button
            className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
          <button
            className={`tab-btn ${activeTab === 'discussion' ? 'active' : ''}`}
            onClick={() => setActiveTab('discussion')}
          >
            <FiMessageCircle /> Discussion
          </button>
        </div>

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="event-detail-content">
            <div className="event-info-grid">
              <div className="info-item">
                <FiCalendar />
                <div>
                  <strong>Start</strong>
                  <p>{format(new Date(event.eventStartDate), 'PPP p')}</p>
                </div>
              </div>
              <div className="info-item">
                <FiCalendar />
                <div>
                  <strong>End</strong>
                  <p>{format(new Date(event.eventEndDate), 'PPP p')}</p>
                </div>
              </div>
              {event.venue && (
                <div className="info-item">
                  <FiMapPin />
                  <div>
                    <strong>Venue</strong>
                    <p>{event.venue}</p>
                  </div>
                </div>
              )}
              <div className="info-item">
                <FiUsers />
                <div>
                  <strong>Registrations</strong>
                  <p>{event.currentRegistrations || 0}{event.registrationLimit ? ` / ${event.registrationLimit}` : ''}</p>
                </div>
              </div>
            </div>

            <div className="event-description-full">
              <h3>About this event</h3>
              <p>{event.description}</p>
            </div>

            {event.eventTags?.length > 0 && (
              <div className="event-tags-section">
                <h3>Tags</h3>
                <div className="tags-list">
                  {event.eventTags.map((tag, i) => (
                    <span key={i} className="event-tag"><FiTag size={12} /> {tag}</span>
                  ))}
                </div>
              </div>
            )}

            {event.registrationFee > 0 && (
              <div className="fee-section">
                <strong>Registration Fee:</strong> ₹{event.registrationFee}
              </div>
            )}
          </div>
        )}

        {/* Register Tab */}
        {activeTab === 'register' && (
          <div className="register-section">
            {!isRegistrationOpen() ? (
              <div className="registration-closed">
                <h3>Registration Closed</h3>
                <p>
                  {event.status !== 'PUBLISHED'
                    ? 'This event is not currently accepting registrations.'
                    : event.registrationLimit && event.currentRegistrations >= event.registrationLimit
                    ? 'This event has reached its registration limit.'
                    : 'The registration deadline has passed.'}
                </p>
              </div>
            ) : (
              <>
                {/* Custom Form Fields */}
                {event.customFormFields?.length > 0 && (
                  <div className="custom-form-section">
                    <h3>Additional Information</h3>
                    {event.customFormFields.map((field, idx) => (
                      <div key={idx} className="form-group">
                        <label>
                          {field.fieldName}
                          {field.isRequired && <span className="required">*</span>}
                        </label>
                        {field.fieldType === 'dropdown' ? (
                          <select
                            value={customFormData[field.fieldName] || ''}
                            onChange={(e) =>
                              setCustomFormData({ ...customFormData, [field.fieldName]: e.target.value })
                            }
                          >
                            <option value="">Select...</option>
                            {field.options?.map((opt, i) => (
                              <option key={i} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : field.fieldType === 'textarea' ? (
                          <textarea
                            value={customFormData[field.fieldName] || ''}
                            onChange={(e) =>
                              setCustomFormData({ ...customFormData, [field.fieldName]: e.target.value })
                            }
                            rows={3}
                          />
                        ) : (
                          <input
                            type={field.fieldType || 'text'}
                            value={customFormData[field.fieldName] || ''}
                            onChange={(e) =>
                              setCustomFormData({ ...customFormData, [field.fieldName]: e.target.value })
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Merchandise Items */}
                {event.eventType === 'MERCHANDISE' && event.merchandiseDetails?.items && (
                  <div className="merch-section">
                    <h3>Select Items</h3>
                    {event.merchandiseDetails.items.map((item) => (
                      <div key={item._id} className="merch-item">
                        <div className="merch-info">
                          <h4>{item.itemName}</h4>
                          <p>₹{item.price} · {item.stock} in stock</p>
                        </div>
                        <input
                          type="number"
                          min="0"
                          max={Math.min(item.stock, event.merchandiseDetails.purchaseLimitPerUser || 10)}
                          value={merchSelections[item._id] || 0}
                          onChange={(e) =>
                            setMerchSelections({ ...merchSelections, [item._id]: e.target.value })
                          }
                          className="merch-qty"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <button
                  className="auth-btn register-btn"
                  onClick={handleRegister}
                  disabled={registering}
                >
                  {registering
                    ? 'Processing...'
                    : event.eventType === 'MERCHANDISE'
                    ? 'Place Order'
                    : 'Register Now'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Discussion Tab */}
        {activeTab === 'discussion' && (
          <div className="discussion-section">
            <div className="messages-list">
              {messages.length === 0 ? (
                <p className="no-data">No messages yet. Start the conversation!</p>
              ) : (
                messages.map((msg) => {
                  const reactionCounts = getReactionCounts(msg.reactions);
                  const replyMsg = msg.replyTo ? messages.find(m => m._id === msg.replyTo) : null;
                  return (
                    <div key={msg._id} className={`message-item ${msg.isPinned ? 'pinned' : ''} ${msg.organizer ? 'organizer-msg' : ''}`}>
                      {/* Reply reference */}
                      {replyMsg && (
                        <div className="reply-reference">
                          <FiCornerUpLeft size={12} />
                          <span className="reply-author">{getMessageAuthorName(replyMsg)}</span>
                          <span className="reply-preview">{replyMsg.message.substring(0, 60)}{replyMsg.message.length > 60 ? '...' : ''}</span>
                        </div>
                      )}
                      <div className="message-header">
                        <strong>
                          {getMessageAuthorName(msg)}
                          {msg.organizer && <span className="organizer-badge">Organizer</span>}
                        </strong>
                        <div className="message-header-right">
                          <span className="message-time">
                            {format(new Date(msg.createdAt), 'MMM dd, h:mm a')}
                          </span>
                          {/* Moderation buttons for organizer */}
                          {user?.role === 'organizer' && (
                            <div className="msg-mod-actions">
                              <button
                                className="msg-action-btn"
                                onClick={() => handleTogglePin(msg._id)}
                                title={msg.isPinned ? 'Unpin' : 'Pin'}
                              >
                                <PinIcon size={14} />
                              </button>
                              <button
                                className="msg-action-btn msg-delete-btn"
                                onClick={() => handleDeleteMessage(msg._id)}
                                title="Delete"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="message-text">{msg.message}</p>
                      {msg.isPinned && <span className="pin-badge"><PinIcon size={12} /> Pinned</span>}
                      {/* Reactions */}
                      <div className="message-reactions">
                        {Object.entries(reactionCounts).map(([emoji, data]) => (
                          <button
                            key={emoji}
                            className={`reaction-btn ${data.userReacted ? 'reacted' : ''}`}
                            onClick={() => handleReaction(msg._id, emoji)}
                          >
                            {emoji} {data.count}
                          </button>
                        ))}
                        <div className="reaction-picker">
                          {REACTION_EMOJIS.map(emoji => (
                            <button
                              key={emoji}
                              className="reaction-pick"
                              onClick={() => handleReaction(msg._id, emoji)}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                        <button
                          className="reply-btn"
                          onClick={() => setReplyTo(msg)}
                        >
                          <FiCornerUpLeft size={14} /> Reply
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            {/* Reply indicator */}
            {replyTo && (
              <div className="reply-indicator">
                <span>Replying to <strong>{getMessageAuthorName(replyTo)}</strong></span>
                <button onClick={() => setReplyTo(null)} className="cancel-reply">&times;</button>
              </div>
            )}
            <form onSubmit={handleSendMessage} className="message-form">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={replyTo ? `Reply to ${getMessageAuthorName(replyTo)}...` : 'Type a message...'}
                className="message-input"
              />
              <button type="submit" className="message-send-btn">
                <FiSend />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
