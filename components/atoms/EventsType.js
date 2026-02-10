'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, DollarSign, Tag, AlertTriangle, Info } from 'lucide-react';
import { toast } from "sonner";

const EventsTypeUi = ({ 
  eventTypes = [], 
  onCreate, 
  onUpdate, 
  onDelete 
}) => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_price: '',
    is_active: true
  });

  const [errors, setErrors] = useState({});

  const mapApiToLocal = (apiEvents) => {
    return apiEvents.map((event, index) => ({
      id: event.id,
      eventId: `EVT-${(index + 1).toString().padStart(3, '0')}`,
      name: event.name || 'Unnamed Event',
      description: event.description || 'No description provided',
      base_price: event.base_price ? parseFloat(event.base_price).toFixed(2) : '0.00',
      is_active: event.is_active !== false,
      created_at: event.created_at,
      updated_at: event.updated_at,
      originalData: event
    }));
  };

  useEffect(() => {
    if (eventTypes && eventTypes.length > 0) {
      const mappedEvents = mapApiToLocal(eventTypes);
      setEvents(mappedEvents);
    } else {
      setEvents([]);
    }
  }, [eventTypes]);

  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm || 
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.eventId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: e.target.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Event name is required';
    if (formData.name.length > 100) newErrors.name = 'Name must be less than 100 characters';
    
    if (formData.base_price) {
      const price = parseFloat(formData.base_price);
      if (isNaN(price)) newErrors.base_price = 'Price must be a valid number';
      if (price < 0) newErrors.base_price = 'Price cannot be negative';
      if (price > 99999999.99) newErrors.base_price = 'Price is too large';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      description: '',
      base_price: '',
      is_active: true
    });
    setEditingEvent(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (event) => {
    setFormData({
      name: event.originalData.name || event.name,
      description: event.originalData.description || event.description,
      base_price: event.originalData.base_price || event.base_price,
      is_active: event.originalData.is_active !== false
    });
    setEditingEvent(event);
    setShowFormModal(true);
  };

  const handleOpenDetailsModal = (event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setShowDetailsModal(false);
    setEditingEvent(null);
    setSelectedEvent(null);
    setErrors({});
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix validation errors');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const submissionData = {
        ...formData,
        base_price: formData.base_price ? parseFloat(formData.base_price) : 0
      };

      if (editingEvent) {
        const result = await onUpdate(editingEvent.id, submissionData);
        if (result.success) {
          const updated = events.map(e => 
            e.id === editingEvent.id 
              ? { ...e, ...mapApiToLocal([{ id: editingEvent.id, ...submissionData }])[0] }
              : e
          );
          setEvents(updated);
          toast.success('Event type updated successfully!');
          handleCloseModal();
        } else {
          toast.error(result.error || 'Failed to update event type');
        }
      } else {
        const result = await onCreate(submissionData);
        if (result.success) {
          toast.success('Event type added successfully!');
          handleCloseModal();
        } else {
          toast.error(result.error || 'Failed to create event type');
        }
      }
    } catch (error) {
      console.error('Error saving event type:', error);
      toast.error('Failed to save event type. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const event = events.find(e => e.id === eventId);
    setDeleteEventId(eventId);
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const confirmDeleteEvent = async () => {
    if (!deleteEventId) return;
    
    setIsLoading(true);
    
    try {
      const result = await onDelete(deleteEventId);
      if (result.success) {
        setEvents(prev => prev.filter(e => e.id !== deleteEventId));
        toast.success('Event type deleted successfully!');
      } else {
        toast.error(result.error || 'Failed to delete event type');
      }
    } catch (error) {
      console.error('Error deleting event type:', error);
      toast.error('Failed to delete event type. Please try again.');
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
      setDeleteEventId(null);
      setSelectedEvent(null);
      handleCloseModal();
    }
  };

  const cancelDeleteEvent = () => {
    setShowDeleteModal(false);
    setDeleteEventId(null);
    setSelectedEvent(null);
  };

  const stats = {
    total: events.length,
    active: events.filter(e => e.is_active).length,
    inactive: events.filter(e => !e.is_active).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Event Types Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage different types of events and their base pricing
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2.5 text-sm rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transition-all flex items-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add Event Type
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Event Types</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-100 flex items-center justify-center">
                <Tag className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-green-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-700">{stats.active}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-100 to-green-50 border border-green-100 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-500">{stats.inactive}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-100 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, description, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((event) => (
            <div key={event.id} className={`bg-white/80 backdrop-blur-sm rounded-xl border transition-all duration-300 overflow-hidden hover:shadow-lg ${
              event.is_active ? 'border-green-200 hover:border-green-300' : 'border-gray-200 hover:border-gray-300'
            }`}>
              {/* Header */}
              <div className={`p-4 border-b ${
                event.is_active ? 'bg-gradient-to-r from-green-50 to-white border-green-100' : 'bg-gradient-to-r from-gray-50 to-white border-gray-100'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
                      event.is_active 
                        ? 'bg-gradient-to-br from-green-100 to-green-50 border-green-100' 
                        : 'bg-gradient-to-br from-gray-100 to-gray-50 border-gray-100'
                    }`}>
                      <Tag className={`w-5 h-5 ${event.is_active ? 'text-green-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 truncate max-w-[180px]">{event.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          event.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {event.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-gray-500">{event.eventId}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Details */}
              <div className="p-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600">Description</p>
                        <p className="text-sm text-gray-800 font-medium mt-0.5 line-clamp-2">{event.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600">Base Price</p>
                        <p className="text-sm text-gray-800 font-medium mt-0.5">
                          ${event.base_price}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenDetailsModal(event)}
                    className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors font-medium"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>
                  
                  <button
                    onClick={() => handleOpenEditModal(event)}
                    className="flex-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-600 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors font-medium"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    disabled={isLoading}
                    className="flex-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors font-medium disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200 flex items-center justify-center mb-4">
            <Tag className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">
            {searchTerm ? 'No matching event types' : 'No event types yet'}
          </h3>
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first event type'}
          </p>
          <button 
            onClick={handleOpenAddModal}
            disabled={isLoading}
            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 py-2.5 text-sm rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 shadow-md hover:shadow-lg transition-all"
          >
            Add Event Type
          </button>
        </div>
      )}

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 max-w-md w-full shadow-2xl transform transition-all duration-300 scale-100">
            {/* Warning Header */}
            <div className="relative">
              <div className="h-2 w-full bg-gradient-to-r from-red-500 to-red-600 rounded-t-2xl"></div>
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-100 to-red-50 border-4 border-white shadow-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
            
            <div className="pt-10 pb-6 px-6">
              <div className="text-center mb-6">
                <h3 className="font-bold text-gray-900 text-xl mb-2">Delete Event Type</h3>
                <p className="text-gray-600 text-sm">This action cannot be undone</p>
              </div>
              
              {/* Event Info */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                    selectedEvent.is_active 
                      ? 'bg-gradient-to-br from-green-100 to-green-50 border-green-100' 
                      : 'bg-gradient-to-br from-gray-100 to-gray-50 border-gray-100'
                  }`}>
                    <Tag className={`w-5 h-5 ${selectedEvent.is_active ? 'text-green-600' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedEvent.name}</h4>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      <span className="text-xs text-gray-500">ID: {selectedEvent.eventId}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        selectedEvent.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedEvent.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-600">Base Price: ${selectedEvent.base_price}</span>
                    </div>
                    {selectedEvent.description && (
                      <div className="flex items-start gap-2">
                        <Info className="w-3.5 h-3.5 text-gray-400 mt-0.5" />
                        <span className="text-xs text-gray-600 line-clamp-2">{selectedEvent.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Warning Message */}
              <div className="bg-gradient-to-r from-red-50 to-red-50/50 border border-red-100 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Important Notice</p>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      This event type will be permanently deleted from the system. 
                      Any existing events using this type may be affected.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={cancelDeleteEvent}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 py-3 text-sm rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteEvent}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 text-sm rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Deleting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete Permanently
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">
                    {editingEvent ? 'Edit Event Type' : 'Add Event Type'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {editingEvent ? 'Update the event type details' : 'Add a new event type to the system'}
                  </p>
                </div>
                <button 
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmitEvent} className="space-y-5">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      maxLength="100"
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white/50 focus:outline-none focus:ring-2 transition-all ${
                        errors.name 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100' 
                          : 'border-gray-300 focus:border-purple-500 focus:ring-purple-100'
                      }`}
                      placeholder="e.g., Wedding, Conference, Birthday"
                    />
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                    <p className="text-xs text-gray-500 mt-1">{formData.name.length}/100 characters</p>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all"
                      placeholder="Describe this event type..."
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Base Price ($)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        name="base_price"
                        value={formData.base_price}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        max="99999999.99"
                        className={`w-full pl-8 pr-3.5 py-2.5 text-sm border rounded-lg bg-white/50 focus:outline-none focus:ring-2 transition-all ${
                          errors.base_price 
                            ? 'border-red-300 focus:border-red-400 focus:ring-red-100' 
                            : 'border-gray-300 focus:border-purple-500 focus:ring-purple-100'
                        }`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.base_price && <p className="text-xs text-red-600 mt-1">{errors.base_price}</p>}
                    <p className="text-xs text-gray-500 mt-1">Leave empty or set to 0 for no base price</p>
                  </div>
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-white/50">
                      <input
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <div>
                        <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                          Active Status
                        </label>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Inactive event types won't be available for new bookings
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 text-sm rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-2.5 text-sm rounded-lg font-medium disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
                  >
                    {isLoading ? 'Saving...' : editingEvent ? 'Update Event Type' : 'Add Event Type'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 max-w-sm w-full shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${
                    selectedEvent.is_active 
                      ? 'bg-gradient-to-br from-green-100 to-green-50 border-green-100' 
                      : 'bg-gradient-to-br from-gray-100 to-gray-50 border-gray-100'
                  }`}>
                    <Tag className={`w-6 h-6 ${selectedEvent.is_active ? 'text-green-600' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{selectedEvent.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{selectedEvent.eventId}</p>
                  </div>
                </div>
                <button 
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${selectedEvent.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className="text-xs font-medium text-gray-700">Status</span>
                    </div>
                    <span className={`px-3 py-1.5 text-sm rounded-lg inline-block ${
                      selectedEvent.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedEvent.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  {selectedEvent.description && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-lg">
                      <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600">Description</p>
                        <p className="text-sm text-gray-900 font-medium mt-1">{selectedEvent.description}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-lg">
                    <DollarSign className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Base Price</p>
                      <p className="text-sm text-gray-900 font-medium mt-1">${selectedEvent.base_price}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50/50 rounded-lg">
                      <p className="text-xs text-gray-600">Created</p>
                      <p className="text-sm text-gray-900 font-medium mt-1">
                        {selectedEvent.created_at ? new Date(selectedEvent.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                    
                    <div className="p-3 bg-gray-50/50 rounded-lg">
                      <p className="text-xs text-gray-600">Last Updated</p>
                      <p className="text-sm text-gray-900 font-medium mt-1">
                        {selectedEvent.updated_at ? new Date(selectedEvent.updated_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleOpenEditModal(selectedEvent);
                    handleCloseModal();
                  }}
                  className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-600 py-2.5 text-sm rounded-lg font-medium transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 text-sm rounded-lg font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsTypeUi;