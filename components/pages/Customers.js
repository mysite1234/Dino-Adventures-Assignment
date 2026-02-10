'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  StatsCards, 
  BookingCard, 
  FilterBar, 
  EventForm, 
  BookingDetails 
} from '@/components/event-bookings';
import { SectionHeader } from '@/components/layout';
import { Plus } from 'lucide-react';

const EventBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
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
    }
  ];

  useEffect(() => {
    setBookings(sampleBookings);
    setFilteredBookings(sampleBookings);
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, bookings]);

  const applyFilters = () => {
    let result = [...bookings];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(booking =>
        booking.event_name?.toLowerCase().includes(searchLower) ||
        booking.customer_name?.toLowerCase().includes(searchLower) ||
        booking.customer_phone?.includes(filters.search) ||
        booking.customer_email?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status !== 'all') {
      result = result.filter(booking => booking.booking_status === filters.status);
    }

    if (filters.eventType !== 'all') {
      result = result.filter(booking => booking.event_type === filters.eventType);
    }

    setFilteredBookings(result);
  };

  const handleCreateBooking = async (formData) => {
    setLoading(true);
    try {
      const newBooking = {
        id: bookings.length + 1,
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setBookings(prev => [...prev, newBooking]);
      toast.success('Booking created successfully!');
      setShowFormModal(false);
    } catch (error) {
      toast.error('Failed to create booking');
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
    } catch (error) {
      toast.error('Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (id) => {
    if (window.confirm('Delete this booking?')) {
      setBookings(prev => prev.filter(booking => booking.id !== id));
      toast.success('Booking deleted!');
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.booking_status === 'Pending').length,
    approved: bookings.filter(b => b.booking_status === 'Approved').length,
    revenue: bookings.reduce((sum, b) => sum + b.booking_amount, 0),
    advance: bookings.reduce((sum, b) => sum + b.advance_amount, 0),
    upcoming: bookings.filter(b => new Date(b.event_date) > new Date()).length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <SectionHeader
        title="Event Bookings"
        subtitle="Manage residency event registrations"
        action={
          <button
            onClick={() => setShowFormModal(true)}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Booking
          </button>
        }
      />

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Filters */}
      <FilterBar filters={filters} onFilterChange={setFilters} />

      {/* Bookings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBookings.map(booking => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onView={() => {
              setSelectedBooking(booking);
              setShowDetailsModal(true);
            }}
            onEdit={() => {
              setSelectedBooking(booking);
              setShowFormModal(true);
            }}
            onDelete={() => handleDeleteBooking(booking.id)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredBookings.length === 0 && (
        <div className="text-center py-12 border rounded-lg bg-white">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">
            {filters.search ? 'No matching bookings' : 'No bookings yet'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {filters.search ? 'Try adjusting your filters' : 'Create your first booking'}
          </p>
          <button
            onClick={() => setShowFormModal(true)}
            className="btn-primary"
          >
            Create Booking
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showFormModal && (
        <EventForm
          booking={selectedBooking}
          onSubmit={selectedBooking ? 
            (data) => handleUpdateBooking(selectedBooking.id, data) :
            handleCreateBooking
          }
          onClose={() => {
            setShowFormModal(false);
            setSelectedBooking(null);
          }}
          loading={loading}
        />
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedBooking && (
        <BookingDetails
          booking={selectedBooking}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBooking(null);
          }}
          onEdit={() => {
            setShowDetailsModal(false);
            setSelectedBooking(selectedBooking);
            setShowFormModal(true);
          }}
          onDelete={() => handleDeleteBooking(selectedBooking.id)}
        />
      )}
    </div>
  );
};

export default EventBooking;