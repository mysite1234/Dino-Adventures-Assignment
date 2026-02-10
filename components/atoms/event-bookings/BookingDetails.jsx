import { 
    Calendar, Clock, Users, MapPin, Phone, Mail, 
    Home, CreditCard, Building2, FileText, 
    Palette, Volume2, Utensils, X, Edit, Trash2, Download
  } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import PaymentBadge from '../ui/PaymentBadge';
import ServiceTag from '../ui/ServiceTag';
  const BookingDetails = ({ booking, onClose, onEdit, onDelete }) => {
    const formatDateTime = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    };
  
    const formatTime = (timeStr) => {
      return timeStr.replace(/:00$/, '');
    };
  
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">Booking Details</h2>
                <p className="text-sm text-gray-600 mt-1">Complete event information</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
  
          <div className="p-6">
            {/* Basic Info */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-xl">{booking.event_name}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded">
                      {booking.event_type}
                    </span>
                    <StatusBadge status={booking.booking_status} />
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Booking ID</p>
                  <p className="font-mono font-semibold text-gray-900">#{booking.id}</p>
                </div>
              </div>
  
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Residency</p>
                    <p className="text-sm font-medium text-gray-900">{booking.residency_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-600">Venue Area</p>
                    <p className="text-sm font-medium text-gray-900">{booking.venue_area}</p>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Event Details */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Event Details
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Event Date</p>
                      <p className="text-sm font-medium">{formatDateTime(booking.event_date)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Timing</p>
                      <p className="text-sm font-medium">
                        {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Guests</p>
                      <p className="text-sm font-medium">{booking.no_of_guests} persons</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Services</p>
                      <div className="flex gap-2 mt-1">
                        {booking.decoration_required && <ServiceTag type="decoration" />}
                        {booking.sound_system && <ServiceTag type="sound" />}
                        {booking.food_required && <ServiceTag type="food" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Customer Details */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-green-500" />
                Customer Information
              </h4>
              <div className="bg-gray-50 rounded p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Name</p>
                    <p className="text-sm font-medium text-gray-900">{booking.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{booking.customer_phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Email</p>
                    <p className="text-sm font-medium text-gray-900">{booking.customer_email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Address</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{booking.customer_address}</p>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Payment Details */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-500" />
                Payment Details
              </h4>
              <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-100 rounded p-4">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total Amount</p>
                    <p className="text-xl font-bold text-gray-900">
                      ₹{booking.booking_amount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Advance Paid</p>
                    <p className="text-xl font-bold text-green-600">
                      ₹{booking.advance_amount.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Payment Mode</p>
                    <p className="text-sm font-medium text-gray-900">{booking.payment_mode}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Payment Status</p>
                    <PaymentBadge status={booking.payment_status} />
                  </div>
                </div>
              </div>
            </div>
  
            {/* Audit & Remarks */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Audit Trail</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-600">Created At</p>
                    <p className="text-sm font-medium">{booking.created_at}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Updated At</p>
                    <p className="text-sm font-medium">{booking.updated_at}</p>
                  </div>
                </div>
              </div>
              
              {booking.remarks && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Remarks</h4>
                  <div className="bg-amber-50 border border-amber-100 rounded p-3">
                    <p className="text-sm text-amber-900">{booking.remarks}</p>
                  </div>
                </div>
              )}
            </div>
  
            {/* Action Buttons */}
            <div className="flex gap-3 mt-8 pt-6 border-t">
              <button
                onClick={() => {/* Handle download */}}
                className="btn-secondary flex-1 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Invoice
              </button>
              <button
                onClick={onEdit}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={onDelete}
                className="btn-danger flex-1 flex items-center justify-center gap-2"
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
  
  export default BookingDetails;