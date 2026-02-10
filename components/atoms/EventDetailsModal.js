// components/atoms/EventDetailsModal.js
import { Calendar, Clock, MapPin, Users, Cake, Heart, X, Edit, Trash2 } from 'lucide-react';

const EventDetailsModal = ({ event, onClose, onEdit, onCancel, onDelete, isLoading }) => {
  const getEventIcon = (type) => {
    switch (type) {
      case 'marriage': return <Heart className="w-6 h-6" />;
      case 'birthday': return <Cake className="w-6 h-6" />;
      default: return <Calendar className="w-6 h-6" />;
    }
  };

  const getEventTypeLabel = (type) => {
    switch (type) {
      case 'marriage': return 'Wedding';
      case 'birthday': return 'Birthday Party';
      default: return 'Anniversary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-muted text-muted-foreground';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-lg border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-primary p-6 text-primary-foreground">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {getEventIcon(event.eventType)}
                <span className="font-semibold text-sm uppercase tracking-wider">
                  {getEventTypeLabel(event.eventType)}
                </span>
              </div>
              <h2 className="text-2xl font-bold">{event.eventTitle}</h2>
              <p className="opacity-90 mt-2">{event.description}</p>
            </div>
            <button 
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary-foreground/10 p-2 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-foreground mb-4">Event Details</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium text-foreground">{formatDate(event.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium text-foreground">{event.timeDisplay}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Venue</p>
                    <p className="font-medium text-foreground">{event.hall}</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Guests</p>
                    <p className="font-medium text-foreground">{event.guests} People</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Booking Information</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Booking ID</p>
                  <p className="font-mono font-bold text-lg text-foreground">{event.bookingId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(event.status)}`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Event Type</p>
                  <p className="font-medium text-foreground">{getEventTypeLabel(event.eventType)}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border">
            <h4 className="font-semibold text-foreground mb-4">Additional Information</h4>
            <p className="text-muted-foreground">
              For any changes to your booking, please contact our event coordinator at least 48 hours before the event.
              Catering and decoration services can be arranged separately through our partner vendors.
            </p>
          </div>
          
          <div className="mt-8 flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 bg-accent border border-input text-accent-foreground py-3 rounded-md font-medium hover:bg-accent/80 transition-all"
            >
              Close
            </button>
            {event.status !== 'cancelled' && event.status !== 'completed' && (
              <div className="flex gap-4">
                <button
                  onClick={onEdit}
                  className="flex-1 bg-primary/10 border border-primary/20 text-primary py-3 rounded-md font-medium hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 bg-destructive/10 border border-destructive/20 text-destructive py-3 rounded-md font-medium hover:bg-destructive/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Processing...' : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Cancel Booking
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;