import { Calendar, Clock, Users, MapPin, Phone, Mail,User  } from 'lucide-react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import PaymentBadge from '../ui/PaymentBadge';
import ServiceTag from '../ui/ServiceTag';
const BookingCard = ({ booking, onView, onEdit, onDelete }) => {
  const eventColors = {
    Marriage: 'border-l-purple-500',
    Birthday: 'border-l-blue-500',
    Anniversary: 'border-l-red-500'
  };

  return (
    <div className={`bg-white border rounded-lg overflow-hidden ${eventColors[booking.event_type] || 'border-l-gray-500'} border-l-4`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{booking.event_name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {booking.event_type}
              </span>
              <StatusBadge status={booking.booking_status} />
            </div>
          </div>
          <PaymentBadge status={booking.payment_status} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Event Details */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">Date</p>
              <p className="text-sm font-medium">{booking.event_date}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">Time</p>
              <p className="text-sm font-medium">{booking.start_time} - {booking.end_time}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">Guests</p>
              <p className="text-sm font-medium">{booking.no_of_guests}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">Venue</p>
              <p className="text-sm font-medium">{booking.venue_area}</p>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="flex flex-wrap gap-2 mb-4">
          {booking.decoration_required && <ServiceTag type="decoration" />}
          {booking.sound_system && <ServiceTag type="sound" />}
          {booking.food_required && <ServiceTag type="food" />}
        </div>

        {/* Customer Info */}
        <div className="border-t pt-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">{booking.customer_name}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Phone className="w-3 h-3" />
                <span className="truncate">{booking.customer_phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="mt-4 pt-3 border-t">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-600">Amount</p>
              <p className="text-sm font-semibold text-gray-900">
                ₹{booking.booking_amount.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Advance</p>
              <p className="text-sm font-semibold text-green-600">
                ₹{booking.advance_amount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-3 border-t">
          <div className="flex gap-2">
            <button
              onClick={onView}
              className="btn-secondary flex-1 flex items-center justify-center gap-1"
            >
              <Eye className="w-4 h-4" />
              View
            </button>
            <button
              onClick={onEdit}
              className="btn-primary flex-1 flex items-center justify-center gap-1"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={onDelete}
              className="btn-danger flex-1 flex items-center justify-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;