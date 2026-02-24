import { useState, useEffect } from 'react';
import { eventAPI } from '../../services/api';
import EventCard from '../../components/common/EventCard';
import GlowingCards from '../../components/common/GlowingCards';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { FiSearch, FiFilter, FiHeart, FiTrendingUp } from 'react-icons/fi';
import './Participant.css';

const BrowseEvents = () => {
  const [events, setEvents] = useState([]);
  const [trendingEvents, setTrendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    eventType: '',
    eligibility: '',
    tag: '',
    sortBy: 'eventStartDate',
    startDate: '',
    endDate: '',
    followedOnly: false,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showTrending, setShowTrending] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const res = await eventAPI.getTrending();
      setTrendingEvents(res.data.data || []);
    } catch (error) {
      console.error('Failed to load trending');
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (search) params.search = search;
      // Convert boolean to string for API
      if (params.followedOnly) params.followedOnly = 'true';
      else delete params.followedOnly;
      // Remove empty params
      Object.keys(params).forEach((key) => {
        if (!params[key]) delete params[key];
      });
      const res = await eventAPI.getEvents(params);
      setEvents(res.data.data || []);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Browse Events</h1>
        <p>Discover and register for exciting events at Felicity</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="search-filter-bar">
        <form onSubmit={handleSearch} className="search-form">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search events by name, description, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>
        <button
          className="filter-toggle-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <FiFilter /> Filters
        </button>
        <button
          className={`filter-toggle-btn ${showTrending ? 'active' : ''}`}
          onClick={() => setShowTrending(!showTrending)}
        >
          <FiTrendingUp /> Trending
        </button>
        <button
          className={`filter-toggle-btn ${filters.followedOnly ? 'active' : ''}`}
          onClick={() => setFilters({ ...filters, followedOnly: !filters.followedOnly })}
        >
          <FiHeart /> Followed Clubs
        </button>
      </div>

      {showTrending && trendingEvents.length > 0 && (
        <div className="trending-section">
          <h3><FiTrendingUp /> Trending Now</h3>
          <GlowingCards className="events-grid">
            {trendingEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </GlowingCards>
        </div>
      )}

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>Event Type</label>
            <select
              value={filters.eventType}
              onChange={(e) => setFilters({ ...filters, eventType: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="NORMAL">Normal Events</option>
              <option value="MERCHANDISE">Merchandise</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Eligibility</label>
            <select
              value={filters.eligibility}
              onChange={(e) => setFilters({ ...filters, eligibility: e.target.value })}
            >
              <option value="">All</option>
              <option value="All">Everyone</option>
              <option value="IIIT Only">IIIT Only</option>
              <option value="Non-IIIT Only">Non-IIIT</option>
            </select>
          </div>
          <div className="filter-group">
            <label>From Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <label>To Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            >
              <option value="eventStartDate">Date</option>
              <option value="currentRegistrations">Popularity</option>
              <option value="createdAt">Newest</option>
            </select>
          </div>
        </div>
      )}

      {/* Events Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : events.length === 0 ? (
        <div className="empty-state">
          <p>No events found. Try adjusting your search or filters.</p>
        </div>
      ) : (
        <GlowingCards className="events-grid">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </GlowingCards>
      )}
    </div>
  );
};

export default BrowseEvents;
