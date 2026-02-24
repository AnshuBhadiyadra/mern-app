import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FiCalendar, FiMapPin, FiUsers, FiTag } from 'react-icons/fi';
import { ShoppingBagIcon, ClipboardIcon } from './SvgIcons';
import './EventCard.css';

const EventCard = ({ event, showOrganizer = true }) => {
  const getStatusBadge = (status) => {
    const statusColors = {
      DRAFT: 'badge-draft',
      PUBLISHED: 'badge-published',
      ONGOING: 'badge-ongoing',
      COMPLETED: 'badge-completed',
      CLOSED: 'badge-closed',
    };
    return statusColors[status] || 'badge-draft';
  };

  const isRegistrationOpen = () => {
    if (event.status !== 'PUBLISHED') return false;
    if (event.registrationDeadline && new Date(event.registrationDeadline) < new Date()) return false;
    if (event.registrationLimit && event.currentRegistrations >= event.registrationLimit) return false;
    return true;
  };

  return (
    <div className="event-card glow-card">
      <div className="event-card-header">
        <span className={`event-status-badge ${getStatusBadge(event.status)}`}>
          {event.status}
        </span>
        <span className="event-type-badge">
          {event.eventType === 'MERCHANDISE' ? <><ShoppingBagIcon /> Merch</> : <><ClipboardIcon /> Event</>}
        </span>
      </div>

      <h3 className="event-card-title">{event.eventName}</h3>

      <p className="event-card-description">
        {event.description?.substring(0, 120)}
        {event.description?.length > 120 ? '...' : ''}
      </p>

      <div className="event-card-details">
        <div className="event-detail-item">
          <FiCalendar />
          <span>{format(new Date(event.eventStartDate), 'MMM dd, yyyy')}</span>
        </div>
        {event.venue && (
          <div className="event-detail-item">
            <FiMapPin />
            <span>{event.venue}</span>
          </div>
        )}
        <div className="event-detail-item">
          <FiUsers />
          <span>
            {event.currentRegistrations || 0}
            {event.registrationLimit ? `/${event.registrationLimit}` : ''} registered
          </span>
        </div>
      </div>

      {event.eventTags?.length > 0 && (
        <div className="event-card-tags">
          {event.eventTags.slice(0, 3).map((tag, i) => (
            <span key={i} className="event-tag">
              <FiTag size={10} />
              {tag}
            </span>
          ))}
        </div>
      )}

      {showOrganizer && event.organizer?.organizerName && (
        <p className="event-card-organizer">
          By {event.organizer.organizerName}
        </p>
      )}

      <div className="event-card-footer">
        {event.registrationFee > 0 && (
          <span className="event-fee">₹{event.registrationFee}</span>
        )}
        {event.registrationFee === 0 && (
          <span className="event-free">Free</span>
        )}
        <Link to={`/participant/events/${event._id}`} className="event-view-btn">
          {isRegistrationOpen() ? 'Register Now' : 'View Details'}
        </Link>
      </div>
    </div>
  );
};

export default EventCard;
