// components/atoms/EventCard.js
import { Calendar, Clock, MapPin, Users, Cake, Heart, ChevronRight } from 'lucide-react';

const EventCard = ({ booking, onViewDetails, onCancelBooking, isLoading }) => {
  const getEventIcon = (type) => {
    switch (type) {
      case 'marriage': return <Heart className="w-5 h-5" />;
      case 'birthday': return <Cake className="w-5 h-5" />;
      default: return <Calendar className="w-5 h-5" />;
    }
  };

  const getEventTypeLabel = (type) => {
    switch (type) {
      case 'marriage': return 'Wedding';
      case 'birthday': return 'Birthday';
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

  return (
    <div className="bg-card rounded-lg border overflow-hidden hover:shadow-md transition-all duration-300">
      <div className="bg-primary p-4 text-primary-foreground">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getEventIcon(booking.eventType)}
            <span className="font-semibold text-sm uppercase tracking-wider">
              {getEventTypeLabel(booking.eventType)}
            </span>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(booking.status)}`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>
        <h3 className="text-xl font-bold mt-3 line-clamp-1">{booking.eventTitle}</h3>
        <p className="text-sm opacity-90 mt-1 line-clamp-2">{booking.description}</p>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent rounded-md">
              <Calendar className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium text-foreground">
                {new Date(booking.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent rounded-md">
              <Clock className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="font-medium text-foreground">{booking.timeDisplay}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent rounded-md">
              <MapPin className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Venue</p>
              <p className="font-medium text-foreground">{booking.hall}</p>
              <p className="text-sm text-muted-foreground mt-1">{booking.location}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-accent rounded-md">
              <Users className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Guests</p>
              <p className="font-medium text-foreground">{booking.guests} People</p>
            </div>
          </div>
          
          <div className="border-t border-border pt-4">
            <p className="text-sm text-muted-foreground mb-1">Booking ID</p>
            <p className="font-mono font-bold text-foreground">{booking.bookingId}</p>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onViewDetails}
            className="flex-1 bg-accent border border-input text-accent-foreground hover:bg-accent/80 py-3 rounded-md font-medium transition-all duration-300 flex items-center justify-center gap-2"
          >
            View Details
            <ChevronRight className="w-4 h-4" />
          </button>
          
          {booking.status !== 'cancelled' && booking.status !== 'completed' && (
            <button
              onClick={onCancelBooking}
              disabled={isLoading}
              className="flex-1 bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 py-3 rounded-md font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : 'Cancel'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;