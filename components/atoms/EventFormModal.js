// components/atoms/EventFormModal.js
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const EventFormModal = ({ event, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    eventTitle: "",
    eventType: "birthday",
    date: "",
    time: "14:00",
    endTime: "18:00",
    location: "",
    guests: 50,
    hall: "",
    description: "",
    status: "pending"
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (event) {
      setFormData({
        eventTitle: event.eventTitle || "",
        eventType: event.eventType || "birthday",
        date: event.date || "",
        time: event.time || "14:00",
        endTime: event.endTime || "18:00",
        location: event.location || "",
        guests: event.guests || 50,
        hall: event.hall || "",
        description: event.description || "",
        status: event.status || "pending"
      });
    }
  }, [event]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'guests' ? parseInt(value) || 0 : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.eventTitle.trim()) newErrors.eventTitle = 'Event title is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (!formData.hall.trim()) newErrors.hall = 'Hall name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (formData.guests < 1) newErrors.guests = 'At least 1 guest is required';
    
    // Validate time range
    if (formData.time && formData.endTime) {
      const start = new Date(`2000-01-01T${formData.time}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      if (end <= start) newErrors.endTime = 'End time must be after start time';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {event ? 'Edit Booking' : 'Create New Booking'}
            </h2>
            <button 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-accent"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="eventTitle"
                  value={formData.eventTitle}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.eventTitle ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="e.g., Smith & Johnson Wedding"
                />
                {errors.eventTitle && (
                  <p className="text-sm text-destructive">{errors.eventTitle}</p>
                )}
              </div>
              
              {/* Event Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Event Type *
                </label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="birthday">Birthday Party</option>
                  <option value="marriage">Wedding</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="other">Other Celebration</option>
                </select>
              </div>
              
              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  min={getTodayDate()}
                  className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.date ? 'border-destructive' : 'border-input'
                  }`}
                />
                {errors.date && (
                  <p className="text-sm text-destructive">{errors.date}</p>
                )}
              </div>
              
              {/* Start Time */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Start Time *
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.time ? 'border-destructive' : 'border-input'
                  }`}
                />
                {errors.time && (
                  <p className="text-sm text-destructive">{errors.time}</p>
                )}
              </div>
              
              {/* End Time */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  End Time *
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.endTime ? 'border-destructive' : 'border-input'
                  }`}
                />
                {errors.endTime && (
                  <p className="text-sm text-destructive">{errors.endTime}</p>
                )}
              </div>
              
              {/* Hall/Venue */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Hall/Venue Name *
                </label>
                <input
                  type="text"
                  name="hall"
                  value={formData.hall}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.hall ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="e.g., Royal Hall"
                />
                {errors.hall && (
                  <p className="text-sm text-destructive">{errors.hall}</p>
                )}
              </div>
              
              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Full Address *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.location ? 'border-destructive' : 'border-input'
                  }`}
                  placeholder="e.g., 123 Celebration Street"
                />
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location}</p>
                )}
              </div>
              
              {/* Number of Guests */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Number of Guests *
                </label>
                <input
                  type="number"
                  name="guests"
                  min="1"
                  max="1000"
                  value={formData.guests}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errors.guests ? 'border-destructive' : 'border-input'
                  }`}
                />
                {errors.guests && (
                  <p className="text-sm text-destructive">{errors.guests}</p>
                )}
              </div>
              
              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="upcoming">Upcoming</option>
                </select>
              </div>
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Describe your event details..."
              />
            </div>
            
            <div className="flex gap-4 pt-6 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-accent border border-input text-accent-foreground py-3 rounded-md font-medium hover:bg-accent/80 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-md font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : event ? 'Update Booking' : 'Create Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventFormModal;