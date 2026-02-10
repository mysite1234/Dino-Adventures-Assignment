// components/atoms/EventDashboard.js
'use client';

import { useState } from 'react';
import EventCard from './EventCard';
import EventStats from './EventStats';
import EventFormModal from './EventFormModal';
import EventDetailsModal from './EventDetailsModal';
import { Plus } from 'lucide-react';

const EventDashboard = () => {
  // Initial hall booking data
  const initialBookings = [
    {
      id: 1,
      eventTitle: "Smith & Johnson Wedding",
      eventType: "marriage",
      date: "2024-06-15",
      time: "14:00",
      endTime: "23:00",
      location: "Grand Ballroom - Crystal Palace",
      guests: 250,
      status: "confirmed",
      hall: "Royal Hall",
      bookingId: "MH-2024-001",
      description: "Wedding ceremony and reception with sit-down dinner"
    },
    {
      id: 2,
      eventTitle: "Emma's 1st Birthday",
      eventType: "birthday",
      date: "2024-06-22",
      time: "11:00",
      endTime: "15:00",
      location: "Garden Pavilion - Sunny Meadows",
      guests: 80,
      status: "upcoming",
      hall: "Garden Pavilion",
      bookingId: "BH-2024-015",
      description: "First birthday party with themed decorations"
    },
    {
      id: 3,
      eventTitle: "Kumar & Sharma Wedding",
      eventType: "marriage",
      date: "2024-06-08",
      time: "16:00",
      endTime: "00:00",
      location: "Heritage Banquet Hall",
      guests: 300,
      status: "completed",
      hall: "Heritage Hall",
      bookingId: "MH-2024-008",
      description: "Traditional wedding with cultural ceremonies"
    },
    {
      id: 4,
      eventTitle: "Golden Jubilee Anniversary",
      eventType: "anniversary",
      date: "2024-06-30",
      time: "18:00",
      endTime: "22:00",
      location: "Sky Lounge - The Grand Hotel",
      guests: 150,
      status: "confirmed",
      hall: "Sky Lounge",
      bookingId: "AH-2024-003",
      description: "50th wedding anniversary celebration"
    },
    {
      id: 5,
      eventTitle: "Rohan's 16th Birthday",
      eventType: "birthday",
      date: "2024-07-05",
      time: "17:00",
      endTime: "21:00",
      location: "Sports Arena - Fun Zone",
      guests: 100,
      status: "upcoming",
      hall: "Sports Arena",
      bookingId: "BH-2024-018",
      description: "Sweet sixteen party with gaming zone"
    },
    {
      id: 6,
      eventTitle: "Chen & Li Wedding",
      eventType: "marriage",
      date: "2024-07-12",
      time: "15:00",
      endTime: "23:00",
      location: "Lotus Pavilion - Oriental Gardens",
      guests: 200,
      status: "pending",
      hall: "Lotus Pavilion",
      bookingId: "MH-2024-012",
      description: "Fusion wedding ceremony"
    }
  ];

  // Format time for display
  const formatTimeForDisplay = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatTimeRange = (startTime, endTime) => {
    return `${formatTimeForDisplay(startTime)} - ${formatTimeForDisplay(endTime)}`;
  };

  const [bookings, setBookings] = useState(initialBookings.map(booking => ({
    ...booking,
    timeDisplay: formatTimeRange(booking.time, booking.endTime)
  })));

  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [modalState, setModalState] = useState({
    type: null, // 'details', 'create', 'edit'
    data: null
  });

  // Filter bookings based on selected filter
  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'marriage') return booking.eventType === 'marriage';
    if (filter === 'birthday') return booking.eventType === 'birthday';
    return booking.status === filter;
  });

  // Modal handlers
  const handleOpenDetailsModal = (booking) => {
    setModalState({
      type: 'details',
      data: booking
    });
  };

  const handleOpenCreateModal = () => {
    setModalState({
      type: 'create',
      data: null
    });
  };

  const handleOpenEditModal = (booking) => {
    setModalState({
      type: 'edit',
      data: booking
    });
  };

  const handleCloseModal = () => {
    setModalState({
      type: null,
      data: null
    });
  };

  // Event handlers
  const handleCancelBooking = async (bookingId) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setBookings(prevBookings => 
      prevBookings.map(booking => 
        booking.id === bookingId 
          ? { 
              ...booking, 
              status: 'cancelled',
              timeDisplay: formatTimeRange(booking.time, booking.endTime)
            }
          : booking
      )
    );
    
    setIsLoading(false);
  };

  const handleDeleteBooking = async (bookingId) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setBookings(prevBookings => 
      prevBookings.filter(booking => booking.id !== bookingId)
    );
    
    setIsLoading(false);
    handleCloseModal();
  };

  const handleSubmitForm = async (formData, isEdit) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (isEdit && modalState.data) {
      // Update existing event
      const updatedBooking = {
        ...modalState.data,
        ...formData,
        timeDisplay: formatTimeRange(formData.time, formData.endTime)
      };
      
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === modalState.data.id
            ? updatedBooking
            : booking
        )
      );
    } else {
      // Create new event
      const newBookingId = formData.eventType === 'marriage' 
        ? `MH-${new Date().getFullYear()}-${(bookings.length + 1).toString().padStart(3, '0')}`
        : formData.eventType === 'birthday'
          ? `BH-${new Date().getFullYear()}-${(bookings.length + 1).toString().padStart(3, '0')}`
          : `AH-${new Date().getFullYear()}-${(bookings.length + 1).toString().padStart(3, '0')}`;
      
      const newBooking = {
        ...formData,
        id: bookings.length + 1,
        bookingId: newBookingId,
        timeDisplay: formatTimeRange(formData.time, formData.endTime)
      };
      
      setBookings(prevBookings => [newBooking, ...prevBookings]);
    }
    
    setIsLoading(false);
    handleCloseModal();
  };

  // Helper functions
  const getStatusCount = (status) => {
    return bookings.filter(booking => booking.status === status).length;
  };

  const getEventTypeCount = (type) => {
    return bookings.filter(booking => booking.eventType === type).length;
  };

  const totalBookings = bookings.length;
  const confirmedCount = getStatusCount('confirmed');
  const upcomingCount = getStatusCount('upcoming');
  const marriageCount = getEventTypeCount('marriage');
  const birthdayCount = getEventTypeCount('birthday');
  const completedCount = getStatusCount('completed');

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-card rounded-lg border p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Hall Booking Dashboard
              </h1>
              <p className="text-muted-foreground">Manage your event bookings and celebrations</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex gap-3">
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground border border-input hover:border-primary'}`}
                >
                  All Events
                </button>
                <button 
                  onClick={() => setFilter('marriage')}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${filter === 'marriage' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground border border-input hover:border-primary'}`}
                >
                  Weddings
                </button>
                <button 
                  onClick={() => setFilter('birthday')}
                  className={`px-4 py-2 rounded-md font-medium transition-all ${filter === 'birthday' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground border border-input hover:border-primary'}`}
                >
                  Birthdays
                </button>
              </div>
              <button 
                onClick={handleOpenCreateModal}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2 mt-3 sm:mt-0"
              >
                <Plus className="w-5 h-5" />
                New Booking
              </button>
            </div>
          </div>
          
          {/* Stats Section */}
          <EventStats 
            totalBookings={totalBookings}
            confirmedCount={confirmedCount}
            upcomingCount={upcomingCount}
            marriageCount={marriageCount}
            birthdayCount={birthdayCount}
            completedCount={completedCount}
          />
        </div>

        {/* Event Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <EventCard
              key={booking.id}
              booking={booking}
              onViewDetails={() => handleOpenDetailsModal(booking)}
              onCancelBooking={() => handleCancelBooking(booking.id)}
              isLoading={isLoading}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredBookings.length === 0 && (
          <div className="bg-card rounded-lg border p-12 text-center mt-8">
            <div className="max-w-md mx-auto">
              <div className="p-4 bg-accent rounded-full w-24 h-24 mx-auto flex items-center justify-center mb-6">
                <Plus className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                No {filter !== 'all' ? filter : ''} Bookings Found
              </h3>
              <p className="text-muted-foreground mb-8">
                {filter === 'all' 
                  ? "You haven't booked any halls yet. Start planning your celebration!" 
                  : `You don't have any ${filter === 'marriage' ? 'wedding' : filter === 'birthday' ? 'birthday' : filter} hall bookings.`}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => setFilter('all')}
                  className="bg-accent border border-input text-accent-foreground px-8 py-3 rounded-md font-medium hover:bg-accent/80 transition-all duration-300"
                >
                  View All Bookings
                </button>
                <button 
                  onClick={handleOpenCreateModal}
                  className="bg-primary text-primary-foreground px-8 py-3 rounded-md font-medium hover:bg-primary/90 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create New Booking
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        {modalState.type === 'details' && (
          <EventDetailsModal
            event={modalState.data}
            onClose={handleCloseModal}
            onEdit={() => handleOpenEditModal(modalState.data)}
            onCancel={() => {
              handleCancelBooking(modalState.data.id);
              handleCloseModal();
            }}
            onDelete={() => handleDeleteBooking(modalState.data.id)}
            isLoading={isLoading}
          />
        )}

        {(modalState.type === 'create' || modalState.type === 'edit') && (
          <EventFormModal
            event={modalState.type === 'edit' ? modalState.data : null}
            onClose={handleCloseModal}
            onSubmit={(formData) => handleSubmitForm(formData, modalState.type === 'edit')}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
};

export default EventDashboard;