'use client';

import { X, Calendar, Users, MapPin, DollarSign, FileText, Phone, Mail, Building, Clock, Tag, CheckCircle, AlertCircle, Edit, Trash2 } from 'lucide-react';

const BookingDetailsModal = ({ isOpen, onClose, booking, onEdit, onDelete }) => {
  if (!isOpen || !booking) return null;

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed':
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeColor = (type) => {
    switch(type?.toLowerCase()) {
      case 'marriage': return 'bg-pink-100 text-pink-800';
      case 'conference': return 'bg-indigo-100 text-indigo-800';
      case 'birthday': return 'bg-amber-100 text-amber-800';
      case 'corporate': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const bookingId = `BK-${String(booking.id).padStart(4, '0')}`;
  const balance = (booking.booking_amount || 0) - (booking.advance_amount || 0);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center">
                <Calendar className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{booking.event_name}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.booking_status)}`}>
                    {booking.booking_status}
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(booking.payment_status)}`}>
                    {booking.payment_status} Payment
                  </span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getEventTypeColor(booking.event_type)}`}>
                    {booking.event_type}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">ID: {bookingId}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Event Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Event Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Event Date & Time</p>
                        <p className="font-medium text-gray-900 mt-1">
                          {booking.event_date} • {booking.start_time} - {booking.end_time}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Number of Guests</p>
                        <p className="font-medium text-gray-900 mt-1">{booking.no_of_guests} guests</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Building className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Venue Details</p>
                        <p className="font-medium text-gray-900 mt-1">{booking.residency_name}</p>
                        <p className="text-sm text-gray-600 mt-1">{booking.venue_area}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Tag className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Services Required</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {booking.decoration_required && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-lg">Decoration</span>
                          )}
                          {booking.sound_system && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-lg">Sound System</span>
                          )}
                          {booking.food_required && (
                            <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-lg">Food & Beverages</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Customer Name</p>
                        <p className="font-medium text-gray-900 mt-1">{booking.customer_name}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Contact Number</p>
                        <p className="font-medium text-gray-900 mt-1">{booking.customer_phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Email Address</p>
                        <p className="font-medium text-gray-900 mt-1">{booking.customer_email}</p>
                      </div>
                    </div>

                    {booking.customer_address && (
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="font-medium text-gray-900 mt-1">{booking.customer_address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Payment & Actions */}
            <div className="space-y-8">
              {/* Payment Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-blue-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-medium text-gray-900">₹{booking.booking_amount?.toLocaleString() || '0'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-green-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-gray-600">Advance Paid</p>
                        <p className="font-medium text-gray-900">₹{booking.advance_amount?.toLocaleString() || '0'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-amber-50/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="text-sm text-gray-600">Balance Due</p>
                        <p className="font-medium text-gray-900">₹{balance.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Payment Mode</p>
                      <p className="font-medium text-gray-900">{booking.payment_mode}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Timeline</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Booking Created</p>
                      <p className="text-sm text-gray-600">{booking.created_at}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Last Updated</p>
                      <p className="text-sm text-gray-600">{booking.updated_at}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Event Date</p>
                      <p className="text-sm text-gray-600">{booking.event_date}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              {booking.remarks && (
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Remarks & Notes</h3>
                  <div className="bg-yellow-50/50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-sm text-gray-700">{booking.remarks}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Last updated: {booking.updated_at}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  onEdit();
                  onClose();
                }}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Booking
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this booking?')) {
                    onDelete(booking.id);
                    onClose();
                  }
                }}
                className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;