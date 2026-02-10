'use client';

import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Eye, Calendar, Users, DollarSign, Building, Phone, Mail, MapPin } from 'lucide-react';

const EventRegistration = ({ 
  events = [], 
  onCreate, 
  onUpdate, 
  onDelete,
  onViewDetails,
  onEditBooking,
  isLoading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    setBookings(events);
  }, [events]);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = !searchTerm || 
      booking.event_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer_phone?.includes(searchTerm) ||
      booking.residency_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookings by event, customer, phone, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Bookings Grid */}
      {filteredBookings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookings.map((booking) => {
            const bookingId = `BK-${String(booking.id).padStart(4, '0')}`;
            
            return (
              <div key={booking.id} className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                {/* Header */}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 truncate max-w-[150px]">{booking.event_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(booking.booking_status)}`}>
                            {booking.booking_status}
                          </span>
                          <span className="text-xs text-gray-500">{bookingId}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${getPaymentStatusColor(booking.payment_status)}`}>
                      {booking.payment_status}
                    </span>
                  </div>
                </div>
                
                {/* Details */}
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600">Customer</p>
                        <p className="text-sm text-gray-800 font-medium mt-0.5">{booking.customer_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <Building className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600">Venue</p>
                        <p className="text-sm text-gray-800 font-medium mt-0.5">{booking.residency_name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600">Date & Time</p>
                        <p className="text-sm text-gray-800 font-medium">
                          {booking.event_date} • {booking.start_time}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600">Amount</p>
                        <p className="text-sm text-gray-800 font-medium">
                          ₹{booking.booking_amount?.toLocaleString() || '0'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => onViewDetails(booking)}
                      className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors font-medium"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                    
                    <button
                      onClick={() => onEditBooking(booking)}
                      className="flex-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors font-medium"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this booking?')) {
                          onDelete(booking.id);
                        }
                      }}
                      className="flex-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">
            {searchTerm ? 'No matching bookings' : 'No bookings yet'}
          </h3>
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first booking to get started'}
          </p>
        </div>
      )}
    </div>
  );
};

export default EventRegistration;