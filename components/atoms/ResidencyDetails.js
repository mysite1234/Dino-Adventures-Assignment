'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Phone, MapPin, Mail, Navigation, Building2, AlertTriangle } from 'lucide-react';
import { toast } from "sonner";

const ResidencyDetails = ({ 
  residencies = [], 
  onCreate, 
  onUpdate, 
  onDelete 
}) => {
  const [residents, setResidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteResidentId, setDeleteResidentId] = useState(null);
  const [editingResident, setEditingResident] = useState(null);
  const [selectedResident, setSelectedResident] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    landmark: '',
    contact: '',
    email: ''
  });

  const [errors, setErrors] = useState({});

  const mapApiToLocal = (apiResidencies) => {
    return apiResidencies.map((residency, index) => ({
      id: residency.id,
      residentId: `RES-${(index + 1).toString().padStart(3, '0')}`,
      name: residency.name || 'Unknown',
      contact: residency.contact || 'Not provided',
      email: residency.email || 'example@email.com',
      address: residency.address || '',
      landmark: residency.landmark || '',
      createdAt: residency.created_at,
      updatedAt: residency.updated_at,
      originalData: residency
    }));
  };

  useEffect(() => {
    if (residencies && residencies.length > 0) {
      const mappedResidents = mapApiToLocal(residencies);
      setResidents(mappedResidents);
    } else {
      // Removed default residency - empty array
      setResidents([]);
    }
  }, [residencies]);

  const filteredResidents = residents.filter(resident => {
    const matchesSearch = !searchTerm || 
      resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resident.contact.includes(searchTerm) ||
      (resident.address && resident.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (resident.landmark && resident.landmark.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.contact.trim()) newErrors.contact = 'Contact number is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    const phoneRegex = /^[+]?[0-9\s\-()]{10,}$/;
    if (formData.contact && !phoneRegex.test(formData.contact.replace(/\s/g, ''))) {
      newErrors.contact = 'Invalid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      address: '',
      landmark: '',
      contact: '',
      email: ''
    });
    setEditingResident(null);
    setShowFormModal(true);
  };

  const handleOpenEditModal = (resident) => {
    setFormData({
      name: resident.originalData.name || resident.name,
      address: resident.originalData.address || resident.address,
      landmark: resident.originalData.landmark || resident.landmark,
      contact: resident.originalData.contact || resident.contact,
      email: resident.originalData.email || resident.email
    });
    setEditingResident(resident);
    setShowFormModal(true);
  };

  const handleOpenDetailsModal = (resident) => {
    setSelectedResident(resident);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setShowDetailsModal(false);
    setEditingResident(null);
    setSelectedResident(null);
    setErrors({});
  };

  const handleSubmitResident = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix validation errors');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (editingResident) {
        const result = await onUpdate(editingResident.id, formData);
        if (result.success) {
          const updated = residents.map(r => 
            r.id === editingResident.id 
              ? { ...r, ...mapApiToLocal([{ id: editingResident.id, ...formData }])[0] }
              : r
          );
          setResidents(updated);
          toast.success('Residency updated successfully!');
          handleCloseModal();
        } else {
          toast.error(result.error || 'Failed to update residency');
        }
      } else {
        const result = await onCreate(formData);
        if (result.success) {
          toast.success('Residency added successfully!');
          handleCloseModal();
        } else {
          toast.error(result.error || 'Failed to create residency');
        }
      }
    } catch (error) {
      console.error('Error saving residency:', error);
      toast.error('Failed to save residency. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteResident = async (residentId) => {
    const resident = residents.find(r => r.id === residentId);
    setDeleteResidentId(residentId);
    setSelectedResident(resident);
    setShowDeleteModal(true);
  };

  const confirmDeleteResident = async () => {
    if (!deleteResidentId) return;
    
    setIsLoading(true);
    
    try {
      const result = await onDelete(deleteResidentId);
      if (result.success) {
        setResidents(prev => prev.filter(r => r.id !== deleteResidentId));
        toast.success('Residency deleted successfully!');
      } else {
        toast.error(result.error || 'Failed to delete residency');
      }
    } catch (error) {
      console.error('Error deleting residency:', error);
      toast.error('Failed to delete residency. Please try again.');
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
      setDeleteResidentId(null);
      setSelectedResident(null);
      handleCloseModal();
    }
  };

  const cancelDeleteResident = () => {
    setShowDeleteModal(false);
    setDeleteResidentId(null);
    setSelectedResident(null);
  };

  const stats = {
    total: residents.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Residency Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              {stats.total} residency{stats.total !== 1 ? 's' : ''} in total
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 text-sm rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 disabled:opacity-50 shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add Residency
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Residencies Grid */}
      {filteredResidents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredResidents.map((resident) => (
            <div key={resident.id} className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 truncate max-w-[150px]">{resident.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{resident.residentId}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Details */}
              <div className="p-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600">Address</p>
                        <p className="text-sm text-gray-800 font-medium mt-0.5">{resident.address}</p>
                      </div>
                    </div>
                    
                    {resident.landmark && (
                      <div className="flex items-start gap-2">
                        <Navigation className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-gray-600">Landmark</p>
                          <p className="text-sm text-gray-800 font-medium mt-0.5">{resident.landmark}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600">Contact</p>
                        <p className="text-sm text-gray-800 font-medium">{resident.contact}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <p className="text-sm text-gray-800 font-medium truncate max-w-[180px]">{resident.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenDetailsModal(resident)}
                    className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors font-medium"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>
                  
                  <button
                    onClick={() => handleOpenEditModal(resident)}
                    className="flex-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors font-medium"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleDeleteResident(resident.id)}
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
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">
            {searchTerm ? 'No matching residencies' : 'No residencies yet'}
          </h3>
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first residency'}
          </p>
          <button 
            onClick={handleOpenAddModal}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-5 py-2.5 text-sm rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 shadow-md hover:shadow-lg transition-all"
          >
            Add Residency
          </button>
        </div>
      )}

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteModal && selectedResident && (
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
                <h3 className="font-bold text-gray-900 text-xl mb-2">Delete Residency</h3>
                <p className="text-gray-600 text-sm">This action cannot be undone</p>
              </div>
              
              {/* Residency Info */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedResident.name}</h4>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      <span className="text-xs text-gray-500">ID: {selectedResident.residentId}</span>
                      <span className="text-xs text-gray-500">Contact: {selectedResident.contact}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-600 truncate">{selectedResident.address}</span>
                    </div>
                    {selectedResident.landmark && (
                      <div className="flex items-center gap-2">
                        <Navigation className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-600">{selectedResident.landmark}</span>
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
                      All data associated with this residency will be permanently deleted from the system. 
                      This includes all records and cannot be recovered.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={cancelDeleteResident}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 py-3 text-sm rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteResident}
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
                    {editingResident ? 'Edit Residency' : 'Add Residency'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {editingResident ? 'Update the residency details' : 'Add a new residency to the system'}
                  </p>
                </div>
                <button 
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmitResident} className="space-y-5">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white/50 focus:outline-none focus:ring-2 transition-all ${
                        errors.name 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                      }`}
                      placeholder="Enter residency name"
                    />
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Address *</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="2"
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white/50 focus:outline-none focus:ring-2 transition-all ${
                        errors.address 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                      }`}
                      placeholder="Enter full address"
                    />
                    {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Landmark</label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-lg bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                      placeholder="e.g., Near Metro Station"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Contact *</label>
                    <input
                      type="tel"
                      name="contact"
                      value={formData.contact}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white/50 focus:outline-none focus:ring-2 transition-all ${
                        errors.contact 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                      }`}
                      placeholder="9876543210"
                    />
                    {errors.contact && <p className="text-xs text-red-600 mt-1">{errors.contact}</p>}
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white/50 focus:outline-none focus:ring-2 transition-all ${
                        errors.email 
                          ? 'border-red-300 focus:border-red-400 focus:ring-red-100' 
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                      }`}
                      placeholder="info@example.com"
                    />
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
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
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 text-sm rounded-lg font-medium disabled:opacity-50 transition-all shadow-md hover:shadow-lg"
                  >
                    {isLoading ? 'Saving...' : editingResident ? 'Update Residency' : 'Add Residency'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedResident && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 max-w-sm w-full shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-100 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{selectedResident.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{selectedResident.residentId}</p>
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
                  <div className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Address</p>
                      <p className="text-sm text-gray-900 font-medium mt-1">{selectedResident.address}</p>
                    </div>
                  </div>
                  
                  {selectedResident.landmark && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-lg">
                      <Navigation className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-600">Landmark</p>
                        <p className="text-sm text-gray-900 font-medium mt-1">{selectedResident.landmark}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-lg">
                    <Phone className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Contact</p>
                      <p className="text-sm text-gray-900 font-medium mt-1">{selectedResident.contact}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="text-sm text-gray-900 font-medium mt-1">{selectedResident.email}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleOpenEditModal(selectedResident);
                    handleCloseModal();
                  }}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2.5 text-sm rounded-lg font-medium transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteResident(selectedResident.id)}
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

export default ResidencyDetails;