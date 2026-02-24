import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiSave } from 'react-icons/fi';
import './Organizer.css';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    eventType: 'NORMAL',
    eligibility: 'All',
    eventStartDate: '',
    eventEndDate: '',
    registrationDeadline: '',
    venue: '',
    registrationLimit: '',
    registrationFee: 0,
    eventTags: '',
    customFormFields: [],
    merchandiseDetails: {
      items: [],
      purchaseLimitPerUser: 5,
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Custom Form Fields
  const addCustomField = () => {
    setFormData({
      ...formData,
      customFormFields: [
        ...formData.customFormFields,
        { fieldName: '', fieldType: 'text', required: false, options: [] },
      ],
    });
  };

  const updateCustomField = (idx, key, value) => {
    const fields = [...formData.customFormFields];
    fields[idx][key] = value;
    setFormData({ ...formData, customFormFields: fields });
  };

  const removeCustomField = (idx) => {
    const fields = formData.customFormFields.filter((_, i) => i !== idx);
    setFormData({ ...formData, customFormFields: fields });
  };

  // Merchandise Items
  const addMerchItem = () => {
    setFormData({
      ...formData,
      merchandiseDetails: {
        ...formData.merchandiseDetails,
        items: [
          ...formData.merchandiseDetails.items,
          { name: '', price: 0, stock: 0, description: '' },
        ],
      },
    });
  };

  const updateMerchItem = (idx, key, value) => {
    const items = [...formData.merchandiseDetails.items];
    items[idx][key] = value;
    setFormData({
      ...formData,
      merchandiseDetails: { ...formData.merchandiseDetails, items },
    });
  };

  const removeMerchItem = (idx) => {
    const items = formData.merchandiseDetails.items.filter((_, i) => i !== idx);
    setFormData({
      ...formData,
      merchandiseDetails: { ...formData.merchandiseDetails, items },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        registrationLimit: formData.registrationLimit ? Number(formData.registrationLimit) : undefined,
        registrationFee: Number(formData.registrationFee),
        eventTags: formData.eventTags
          ? formData.eventTags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      };

      if (formData.eventType !== 'MERCHANDISE') {
        delete payload.merchandiseDetails;
      }

      const res = await eventAPI.createEvent(payload);
      toast.success('Event created successfully!');
      navigate(`/organizer/events/${res.data.data._id}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Create New Event</h1>
        <p>Fill in the details to create your event</p>
      </div>

      <form onSubmit={handleSubmit} className="create-event-form">
        {/* Basic Info */}
        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-group">
            <label>Event Name *</label>
            <input
              type="text"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              placeholder="Enter event name"
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event..."
              rows={4}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Event Type *</label>
              <select name="eventType" value={formData.eventType} onChange={handleChange}>
                <option value="NORMAL">Normal Event</option>
                <option value="MERCHANDISE">Merchandise</option>
              </select>
            </div>
            <div className="form-group">
              <label>Eligibility *</label>
              <select name="eligibility" value={formData.eligibility} onChange={handleChange}>
                <option value="All">All Participants</option>
                <option value="IIIT Only">IIIT Students Only</option>
                <option value="Non-IIIT Only">External Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="form-section">
          <h2>Schedule & Venue</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date & Time *</label>
              <input
                type="datetime-local"
                name="eventStartDate"
                value={formData.eventStartDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date & Time *</label>
              <input
                type="datetime-local"
                name="eventEndDate"
                value={formData.eventEndDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Registration Deadline</label>
              <input
                type="datetime-local"
                name="registrationDeadline"
                value={formData.registrationDeadline}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>Venue</label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="Event venue"
              />
            </div>
          </div>
        </div>

        {/* Registration Settings */}
        <div className="form-section">
          <h2>Registration Settings</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Registration Limit</label>
              <input
                type="number"
                name="registrationLimit"
                value={formData.registrationLimit}
                onChange={handleChange}
                placeholder="Leave empty for unlimited"
                min={1}
              />
            </div>
            <div className="form-group">
              <label>Registration Fee (₹)</label>
              <input
                type="number"
                name="registrationFee"
                value={formData.registrationFee}
                onChange={handleChange}
                min={0}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              name="eventTags"
              value={formData.eventTags}
              onChange={handleChange}
              placeholder="e.g., music, dance, competition"
            />
          </div>
        </div>

        {/* Custom Form Fields */}
        <div className="form-section">
          <div className="section-header">
            <h2>Custom Form Fields</h2>
            <button type="button" className="add-btn" onClick={addCustomField}>
              <FiPlus /> Add Field
            </button>
          </div>
          <p className="section-hint">Add custom fields to collect additional info during registration</p>

          {formData.customFormFields.map((field, idx) => (
            <div key={idx} className="dynamic-field-row">
              <input
                type="text"
                value={field.fieldName}
                onChange={(e) => updateCustomField(idx, 'fieldName', e.target.value)}
                placeholder="Field name"
              />
              <select
                value={field.fieldType}
                onChange={(e) => updateCustomField(idx, 'fieldType', e.target.value)}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="email">Email</option>
                <option value="textarea">Text Area</option>
                <option value="select">Dropdown</option>
              </select>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateCustomField(idx, 'required', e.target.checked)}
                />
                Required
              </label>
              <button type="button" className="remove-btn" onClick={() => removeCustomField(idx)}>
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>

        {/* Merchandise Items */}
        {formData.eventType === 'MERCHANDISE' && (
          <div className="form-section">
            <div className="section-header">
              <h2>Merchandise Items</h2>
              <button type="button" className="add-btn" onClick={addMerchItem}>
                <FiPlus /> Add Item
              </button>
            </div>

            <div className="form-group">
              <label>Purchase Limit Per User</label>
              <input
                type="number"
                value={formData.merchandiseDetails.purchaseLimitPerUser}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    merchandiseDetails: {
                      ...formData.merchandiseDetails,
                      purchaseLimitPerUser: Number(e.target.value),
                    },
                  })
                }
                min={1}
              />
            </div>

            {formData.merchandiseDetails.items.map((item, idx) => (
              <div key={idx} className="merch-field-group">
                <div className="form-row">
                  <div className="form-group">
                    <label>Item Name</label>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateMerchItem(idx, 'name', e.target.value)}
                      placeholder="Item name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Price (₹)</label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => updateMerchItem(idx, 'price', Number(e.target.value))}
                      min={0}
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock</label>
                    <input
                      type="number"
                      value={item.stock}
                      onChange={(e) => updateMerchItem(idx, 'stock', Number(e.target.value))}
                      min={0}
                    />
                  </div>
                </div>
                <button type="button" className="remove-btn" onClick={() => removeMerchItem(idx)}>
                  <FiTrash2 /> Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="submit" className="auth-btn submit-btn" disabled={saving}>
          <FiSave />
          {saving ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
