'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Calendar, Users, DollarSign, CheckCircle, Clock, TrendingUp, Filter, Download, Eye } from 'lucide-react';
import EventRegistration from '@/components/atoms/event-registration/EventRegistration';
import BookingFormModal from '@/components/atoms/event-registration/BookingFormModal';
import BookingDetailsModal from '@/components/atoms/event-registration/BookingDetailsModal';




const EventBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    eventType: 'all',
    dateRange: 'all'
  });

  // Sample data
  const sampleBookings = [
    {
      id: 1,
      residency_id: 101,
      residency_name: "Green Villa",
      event_type: "Marriage",
      event_name: "Ravi-Anita Wedding",
      event_date: "2024-06-15",
      start_time: "14:00",
      end_time: "22:00",
      no_of_guests: 250,
      venue_area: "Garden & Hall",
      decoration_required: true,
      sound_system: true,
      food_required: true,
      customer_name: "Ravi Kumar",
      customer_phone: "9876543210",
      customer_email: "ravi.kumar@email.com",
      customer_address: "123 Main Street, Bangalore",
      booking_amount: 150000,
      advance_amount: 50000,
      payment_mode: "UPI",
      payment_status: "Partial",
      booking_status: "Approved",
      remarks: "Need vegan food options",
      created_at: "2024-05-01 10:30:00",
      updated_at: "2024-05-10 14:20:00"
    },
    {
      id: 2,
      residency_id: 102,
      residency_name: "Blue Mansion",
      event_type: "Conference",
      event_name: "Tech Summit 2024",
      event_date: "2024-07-20",
      start_time: "09:00",
      end_time: "18:00",
      no_of_guests: 500,
      venue_area: "Conference Hall",
      decoration_required: false,
      sound_system: true,
      food_required: true,
      customer_name: "Tech Corp Inc",
      customer_phone: "9876543211",
      customer_email: "events@techcorp.com",
      customer_address: "456 Tech Park, Hyderabad",
      booking_amount: 250000,
      advance_amount: 100000,
      payment_mode: "Bank Transfer",
      payment_status: "Paid",
      booking_status: "Confirmed",
      remarks: "Projector and WiFi required",
      created_at: "2024-05-15 11:30:00",
      updated_at: "2024-05-16 09:20:00"
    },
    {
      id: 3,
      residency_id: 103,
      residency_name: "Royal Palace",
      event_type: "Birthday",
      event_name: "Aarav's 1st Birthday",
      event_date: "2024-08-10",
      start_time: "16:00",
      end_time: "20:00",
      no_of_guests: 100,
      venue_area: "Poolside",
      decoration_required: true,
      sound_system: true,
      food_required: true,
      customer_name: "Priya Sharma",
      customer_phone: "9876543212",
      customer_email: "priya.sharma@email.com",
      customer_address: "789 Rose Lane, Mumbai",
      booking_amount: 75000,
      advance_amount: 25000,
      payment_mode: "Cash",
      payment_status: "Pending",
      booking_status: "Pending",
      remarks: "Kids friendly setup needed",
      created_at: "2024-05-20 14:45:00",
      updated_at: "2024-05-20 14:45:00"
    },
    {
      id: 4,
      residency_id: 104,
      residency_name: "Grand Plaza",
      event_type: "Corporate",
      event_name: "Annual Gala Dinner",
      event_date: "2024-09-05",
      start_time: "19:00",
      end_time: "23:00",
      no_of_guests: 300,
      venue_area: "Grand Ballroom",
      decoration_required: true,
      sound_system: true,
      food_required: true,
      customer_name: "Global Enterprises Ltd",
      customer_phone: "9876543213",
      customer_email: "events@globalent.com",
      customer_address: "789 Corporate Ave, Delhi",
      booking_amount: 300000,
      advance_amount: 150000,
      payment_mode: "Bank Transfer",
      payment_status: "Partial",
      booking_status: "Confirmed",
      remarks: "Formal setup with stage",
      created_at: "2024-05-25 09:15:00",
      updated_at: "2024-05-26 11:30:00"
    }
  ];

  useEffect(() => {
    setBookings(sampleBookings);
  }, []);

  const handleCreateBooking = async (formData) => {
    setLoading(true);
    try {
      const newBooking = {
        id: bookings.length + 1,
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        booking_status: formData.booking_status || 'Pending',
        payment_status: formData.payment_status || 'Pending'
      };
      
      setBookings(prev => [...prev, newBooking]);
      toast.success('Booking created successfully!');
      setShowFormModal(false);
      return { success: true };
    } catch (error) {
      console.error('Create error:', error);
      toast.error('Failed to create booking');
      return { success: false, error: 'Failed to create booking' };
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBooking = async (id, formData) => {
    setLoading(true);
    try {
      setBookings(prev => prev.map(booking =>
        booking.id === id 
          ? { ...booking, ...formData, updated_at: new Date().toISOString() }
          : booking
      ));
      toast.success('Booking updated successfully!');
      setShowFormModal(false);
      setEditingBooking(null);
      return { success: true };
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update booking');
      return { success: false, error: 'Failed to update booking' };
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (id) => {
    setLoading(true);
    try {
      setBookings(prev => prev.filter(booking => booking.id !== id));
      toast.success('Booking deleted successfully!');
      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete booking');
      return { success: false, error: 'Failed to delete booking' };
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFormModal = (booking = null) => {
    setEditingBooking(booking);
    setShowFormModal(true);
  };

  const handleOpenDetailsModal = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleCloseModals = () => {
    setShowFormModal(false);
    setShowDetailsModal(false);
    setSelectedBooking(null);
    setEditingBooking(null);
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.booking_status === 'Pending').length,
    confirmed: bookings.filter(b => b.booking_status === 'Confirmed').length,
    approved: bookings.filter(b => b.booking_status === 'Approved').length,
    cancelled: bookings.filter(b => b.booking_status === 'Cancelled').length,
    upcoming: bookings.filter(b => new Date(b.event_date) > new Date()).length,
    revenue: bookings.reduce((sum, b) => sum + (b.booking_amount || 0), 0),
    advance: bookings.reduce((sum, b) => sum + (b.advance_amount || 0), 0),
    balance: bookings.reduce((sum, b) => sum + ((b.booking_amount || 0) - (b.advance_amount || 0)), 0)
  };

  const statusStats = [
    { label: 'Total Bookings', value: stats.total, icon: Calendar, color: 'bg-blue-500', textColor: 'text-blue-600' },
    { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: 'bg-green-500', textColor: 'text-green-600' },
    { label: 'Pending', value: stats.pending, icon: Clock, color: 'bg-yellow-500', textColor: 'text-yellow-600' },
    { label: 'Upcoming', value: stats.upcoming, icon: TrendingUp, color: 'bg-purple-500', textColor: 'text-purple-600' },
    { label: 'Total Revenue', value: `₹${(stats.revenue / 1000).toFixed(0)}K`, icon: DollarSign, color: 'bg-emerald-500', textColor: 'text-emerald-600' },
    { label: 'Advance Collected', value: `₹${(stats.advance / 1000).toFixed(0)}K`, icon: DollarSign, color: 'bg-cyan-500', textColor: 'text-cyan-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Event Booking Management</h1>
            <p className="text-sm md:text-base text-gray-600 mt-2">
              Manage and track all event bookings, reservations, and client details in one place
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => handleOpenFormModal()}
              disabled={loading}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
            >
              <Calendar className="w-4 h-4" />
              New Booking
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {statusStats.map((stat, index) => (
            <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
              </div>
              <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${stat.color} rounded-full`} style={{ width: '75%' }}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-medium">Total Revenue</p>
                <p className="text-2xl md:text-3xl font-bold text-blue-900 mt-2">₹{stats.revenue.toLocaleString()}</p>
                <p className="text-xs text-blue-600 mt-1">From all bookings</p>
              </div>
              <DollarSign className="w-10 h-10 text-blue-600 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100/50 rounded-2xl border border-green-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium">Advance Collected</p>
                <p className="text-2xl md:text-3xl font-bold text-green-900 mt-2">₹{stats.advance.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">Received in advance</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-amber-700 font-medium">Pending Balance</p>
                <p className="text-2xl md:text-3xl font-bold text-amber-900 mt-2">₹{stats.balance.toLocaleString()}</p>
                <p className="text-xs text-amber-600 mt-1">To be collected</p>
              </div>
              <Clock className="w-10 h-10 text-amber-600 opacity-80" />
            </div>
          </div>
        </div>
      </div>

      {/* Event Registration Component */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">All Bookings</h2>
            <p className="text-sm text-gray-600 mt-1">{bookings.length} total bookings</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleOpenFormModal()}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Add Booking
            </button>
          </div>
        </div>
        
        <EventRegistration 
          events={bookings}
          onCreate={handleCreateBooking}
          onUpdate={handleUpdateBooking}
          onDelete={handleDeleteBooking}
          onViewDetails={handleOpenDetailsModal}
          onEditBooking={handleOpenFormModal}
          isLoading={loading}
        />
      </div>

      {/* Large Form Modal */}
      <BookingFormModal
        isOpen={showFormModal}
        onClose={handleCloseModals}
        onSubmit={editingBooking ? (data) => handleUpdateBooking(editingBooking.id, data) : handleCreateBooking}
        initialData={editingBooking}
        isLoading={loading}
        isEditing={!!editingBooking}
      />

      {/* Large Details Modal */}
      <BookingDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseModals}
        booking={selectedBooking}
        onEdit={() => {
          setEditingBooking(selectedBooking);
          setShowDetailsModal(false);
          setShowFormModal(true);
        }}
        onDelete={handleDeleteBooking}
      />
    </div>
  );
};

export default EventBooking;