'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, Users, MapPin, DollarSign, FileText, Phone, Mail, Building, Clock, Tag, CheckCircle, AlertCircle, Plus, Trash2, Edit, Sparkles, Music, Camera, Car, Bed, Utensils, Video, Star, Package, Zap, ChevronRight, ChevronLeft } from 'lucide-react';

const BookingFormModal = ({ isOpen, onClose, onSubmit, initialData, isLoading, isEditing }) => {
  const [formData, setFormData] = useState({
    event_type: 'Marriage',
    event_name: '',
    event_date: '',
    start_time: '14:00',
    end_time: '22:00',
    no_of_guests: '100',
    venue_area: '',
    residency_name: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    booking_amount: '',
    advance_amount: '',
    payment_mode: 'UPI',
    payment_status: 'Pending',
    booking_status: 'Pending',
    remarks: '',
    services: []
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('event');
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceQuantity, setServiceQuantity] = useState('1');
  const [serviceCost, setServiceCost] = useState('');
  const [editingServiceIndex, setEditingServiceIndex] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Compact services catalog
  const defaultServices = [
    { id: 1, name: 'Decoration', description: 'Theme decoration', category: 'Venue', baseCost: 25000, icon: Sparkles },
    { id: 2, name: 'Sound System', description: 'Audio setup', category: 'Equipment', baseCost: 15000, icon: Music },
    { id: 3, name: 'Food Catering', description: 'Buffet service', category: 'Food', baseCost: 500, icon: Utensils, perGuest: true },
    { id: 4, name: 'Photography', description: 'Professional photos', category: 'Media', baseCost: 30000, icon: Camera },
    { id: 5, name: 'Videography', description: 'Video recording', category: 'Media', baseCost: 40000, icon: Video },
    { id: 6, name: 'DJ & Music', description: 'Entertainment', category: 'Entertainment', baseCost: 20000, icon: Music },
    { id: 7, name: 'Transport', description: 'Guest transport', category: 'Logistics', baseCost: 10000, icon: Car },
    { id: 8, name: 'Accommodation', description: 'Guest stay', category: 'Hospitality', baseCost: 1500, icon: Bed, perGuest: true },
  ];

  const serviceCategories = [
    { id: 'all', name: 'All', icon: Package },
    { id: 'Venue', name: 'Venue', icon: Building },
    { id: 'Equipment', name: 'Equipment', icon: Zap },
    { id: 'Food', name: 'Food', icon: Utensils },
    { id: 'Media', name: 'Media', icon: Camera },
    { id: 'Entertainment', name: 'Entertainment', icon: Star },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        event_type: initialData.event_type || 'Marriage',
        event_name: initialData.event_name || '',
        event_date: initialData.event_date || '',
        start_time: initialData.start_time || '14:00',
        end_time: initialData.end_time || '22:00',
        no_of_guests: initialData.no_of_guests || '100',
        venue_area: initialData.venue_area || '',
        residency_name: initialData.residency_name || '',
        customer_name: initialData.customer_name || '',
        customer_email: initialData.customer_email || '',
        customer_phone: initialData.customer_phone || '',
        customer_address: initialData.customer_address || '',
        booking_amount: initialData.booking_amount || '',
        advance_amount: initialData.advance_amount || '',
        payment_mode: initialData.payment_mode || 'UPI',
        payment_status: initialData.payment_status || 'Pending',
        booking_status: initialData.booking_status || 'Pending',
        remarks: initialData.remarks || '',
        services: initialData.services || []
      });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAddService = () => {
    if (!serviceName.trim()) return;
    
    const newService = {
      id: Date.now(),
      name: serviceName,
      description: serviceDescription,
      quantity: parseInt(serviceQuantity) || 1,
      cost: parseFloat(serviceCost) || 0,
      totalCost: (parseFloat(serviceCost) || 0) * (parseInt(serviceQuantity) || 1)
    };

    if (editingServiceIndex !== null) {
      const updatedServices = [...formData.services];
      updatedServices[editingServiceIndex] = newService;
      setFormData(prev => ({ ...prev, services: updatedServices }));
      setEditingServiceIndex(null);
    } else {
      setFormData(prev => ({ ...prev, services: [...prev.services, newService] }));
    }

    setServiceName('');
    setServiceDescription('');
    setServiceQuantity('1');
    setServiceCost('');
  };

  const handleEditService = (index) => {
    const service = formData.services[index];
    setServiceName(service.name);
    setServiceDescription(service.description);
    setServiceQuantity(service.quantity.toString());
    setServiceCost(service.cost.toString());
    setEditingServiceIndex(index);
  };

  const handleRemoveService = (index) => {
    const updatedServices = formData.services.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, services: updatedServices }));
  };

  const handleAddDefaultService = (service) => {
    const quantity = service.perGuest ? parseInt(formData.no_of_guests) || 1 : 1;
    const newService = {
      id: Date.now(),
      name: service.name,
      description: service.description,
      quantity: quantity,
      cost: service.baseCost,
      totalCost: service.baseCost * quantity,
      category: service.category,
      icon: service.icon,
      perGuest: service.perGuest
    };

    setFormData(prev => ({ ...prev, services: [...prev.services, newService] }));
  };

  const calculateServicesTotal = () => {
    return formData.services.reduce((sum, service) => 
      sum + (service.cost || 0) * (service.quantity || 1), 0);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.event_name.trim()) newErrors.event_name = 'Required';
    if (!formData.customer_name.trim()) newErrors.customer_name = 'Required';
    if (!formData.customer_email.trim()) newErrors.customer_email = 'Required';
    if (!formData.customer_phone.trim()) newErrors.customer_phone = 'Required';
    if (!formData.event_date.trim()) newErrors.event_date = 'Required';
    if (!formData.venue_area.trim()) newErrors.venue_area = 'Required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.customer_email && !emailRegex.test(formData.customer_email)) {
      newErrors.customer_email = 'Invalid email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const servicesTotal = calculateServicesTotal();
      const finalData = {
        ...formData,
        booking_amount: formData.booking_amount || servicesTotal.toString()
      };
      onSubmit(finalData);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'event', label: 'Event', icon: Calendar },
    { id: 'customer', label: 'Customer', icon: Users },
    { id: 'services', label: 'Services', icon: Package },
    { id: 'payment', label: 'Payment', icon: DollarSign }
  ];

  const filteredServices = selectedCategory === 'all' 
    ? defaultServices 
    : defaultServices.filter(service => service.category === selectedCategory);

  const servicesTotal = calculateServicesTotal();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100] overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl">
        {/* Compact Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg">
                  {isEditing ? 'Edit Booking' : 'New Booking'}
                </h2>
                <div className="flex items-center gap-4 mt-1">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`text-sm font-medium transition-all relative ${
                        activeTab === tab.id
                          ? 'text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <div className="absolute -bottom-4 left-0 w-full h-0.5 bg-blue-600 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Compact Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit}>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Step {tabs.findIndex(t => t.id === activeTab) + 1} of 4</span>
                <span>{Math.round((tabs.findIndex(t => t.id === activeTab) + 1) / 4 * 100)}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${(tabs.findIndex(t => t.id === activeTab) + 1) / 4 * 100}%` }}
                ></div>
              </div>
            </div>

            {activeTab === 'event' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Event Type</label>
                    <select
                      name="event_type"
                      value={formData.event_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Marriage">Marriage</option>
                      <option value="Conference">Conference</option>
                      <option value="Birthday">Birthday</option>
                      <option value="Corporate">Corporate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Event Name *</label>
                    <input
                      type="text"
                      name="event_name"
                      value={formData.event_name}
                      onChange={handleInputChange}
                      placeholder="Event name"
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 ${
                        errors.event_name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.event_name && <p className="text-xs text-red-500 mt-1">{errors.event_name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Date *</label>
                    <input
                      type="date"
                      name="event_date"
                      value={formData.event_date}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 ${
                        errors.event_date ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.event_date && <p className="text-xs text-red-500 mt-1">{errors.event_date}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Guests *</label>
                    <input
                      type="number"
                      name="no_of_guests"
                      value={formData.no_of_guests}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Time</label>
                    <div className="flex gap-2">
                      <input
                        type="time"
                        name="start_time"
                        value={formData.start_time}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <span className="text-gray-400 self-center">to</span>
                      <input
                        type="time"
                        name="end_time"
                        value={formData.end_time}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Venue Area *</label>
                    <input
                      type="text"
                      name="venue_area"
                      value={formData.venue_area}
                      onChange={handleInputChange}
                      placeholder="e.g., Garden, Hall"
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 ${
                        errors.venue_area ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.venue_area && <p className="text-xs text-red-500 mt-1">{errors.venue_area}</p>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'customer' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Name *</label>
                    <input
                      type="text"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleInputChange}
                      placeholder="Full name"
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 ${
                        errors.customer_name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.customer_name && <p className="text-xs text-red-500 mt-1">{errors.customer_name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Email *</label>
                    <input
                      type="email"
                      name="customer_email"
                      value={formData.customer_email}
                      onChange={handleInputChange}
                      placeholder="email@example.com"
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 ${
                        errors.customer_email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.customer_email && <p className="text-xs text-red-500 mt-1">{errors.customer_email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone *</label>
                    <input
                      type="tel"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleInputChange}
                      placeholder="9876543210"
                      className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 ${
                        errors.customer_phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.customer_phone && <p className="text-xs text-red-500 mt-1">{errors.customer_phone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Venue Name</label>
                    <input
                      type="text"
                      name="residency_name"
                      value={formData.residency_name}
                      onChange={handleInputChange}
                      placeholder="Venue/residency name"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Address</label>
                    <textarea
                      name="customer_address"
                      value={formData.customer_address}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Customer address"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="space-y-4">
                {/* Quick Stats */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-blue-700">Selected Services</p>
                      <p className="font-medium text-blue-900">{formData.services.length} items</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-700">Total</p>
                      <p className="text-lg font-bold text-blue-900">₹{servicesTotal.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Service Categories */}
                <div className="flex gap-1 overflow-x-auto pb-2">
                  {serviceCategories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <category.icon className="w-3 h-3" />
                      {category.name}
                    </button>
                  ))}
                </div>

                {/* Service Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {filteredServices.map(service => {
                    const ServiceIcon = service.icon;
                    const isSelected = formData.services.some(s => s.name === service.name);
                    
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => !isSelected && handleAddDefaultService(service)}
                        disabled={isSelected}
                        className={`p-2 rounded-lg border text-left transition-colors ${
                          isSelected
                            ? 'bg-green-50 border-green-300'
                            : 'bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className={`w-6 h-6 rounded flex items-center justify-center ${
                            isSelected ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            <ServiceIcon className="w-3 h-3" />
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          )}
                        </div>
                        <h4 className="font-medium text-gray-900 text-xs mb-0.5">{service.name}</h4>
                        <p className="text-[10px] text-gray-500 truncate">{service.description}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs font-medium text-gray-900">
                            ₹{service.baseCost.toLocaleString()}
                          </span>
                          {service.perGuest && (
                            <span className="text-[10px] text-purple-600">/guest</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Services List */}
                {formData.services.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-medium text-gray-700">Selected Items</h4>
                      <span className="text-xs text-gray-500">{formData.services.length} services</span>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {formData.services.map((service, index) => {
                        const ServiceIcon = service.icon || Package;
                        const totalCost = (service.cost || 0) * (service.quantity || 1);
                        
                        return (
                          <div key={service.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                                <ServiceIcon className="w-3 h-3 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-900">{service.name}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-gray-500">Qty: {service.quantity}</span>
                                  <span className="text-[10px] text-gray-500">× ₹{service.cost?.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium text-gray-900">₹{totalCost.toLocaleString()}</span>
                              <button
                                type="button"
                                onClick={() => handleEditService(index)}
                                className="p-0.5 text-blue-600 hover:bg-blue-100 rounded"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveService(index)}
                                className="p-0.5 text-red-600 hover:bg-red-100 rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Custom Service Form */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Add Custom Service</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={serviceName}
                      onChange={(e) => setServiceName(e.target.value)}
                      placeholder="Service name"
                      className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      value={serviceCost}
                      onChange={(e) => setServiceCost(e.target.value)}
                      placeholder="Cost (₹)"
                      className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <input
                      type="number"
                      value={serviceQuantity}
                      onChange={(e) => setServiceQuantity(e.target.value)}
                      placeholder="Qty"
                      min="1"
                      className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddService}
                      disabled={!serviceName.trim()}
                      className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      {editingServiceIndex !== null ? 'Update' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Total Amount (₹)</label>
                    <input
                      type="number"
                      name="booking_amount"
                      value={formData.booking_amount || servicesTotal}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Services: ₹{servicesTotal.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Advance (₹)</label>
                    <input
                      type="number"
                      name="advance_amount"
                      value={formData.advance_amount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Payment Mode</label>
                    <select
                      name="payment_mode"
                      value={formData.payment_mode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Card">Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Payment Status</label>
                    <select
                      name="payment_status"
                      value={formData.payment_status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Partial">Partial</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Booking Status</label>
                    <select
                      name="booking_status"
                      value={formData.booking_status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Approved">Approved</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Summary</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Services Total</span>
                      <span>₹{servicesTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Grand Total</span>
                      <span className="font-medium">₹{(parseFloat(formData.booking_amount) || servicesTotal).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1 border-t border-gray-200">
                      <span className="text-gray-600">Advance Paid</span>
                      <span className="text-green-600">₹{(parseFloat(formData.advance_amount) || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Balance Due</span>
                      <span className="text-amber-600 font-medium">
                        ₹{Math.max(0, (parseFloat(formData.booking_amount) || servicesTotal) - (parseFloat(formData.advance_amount) || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Remarks</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Additional notes..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Compact Navigation */}
            <div className=" bottom-0 bg-white pt-4 mt-6 border-t border-gray-200 -mx-6 px-6">
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = tabs.findIndex(t => t.id === activeTab);
                    if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1].id);
                  }}
                  className={`px-4 py-2 text-sm rounded-lg flex items-center gap-1 ${
                    tabs.findIndex(t => t.id === activeTab) === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>

                <div className="flex items-center gap-2">
                  {activeTab === 'payment' ? (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          {isEditing ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          {isEditing ? 'Update' : 'Create Booking'}
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = tabs.findIndex(t => t.id === activeTab);
                        if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1].id);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center gap-1"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingFormModal;