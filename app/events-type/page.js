"use client";

import { useEffect, useState } from "react";
import { getEventTypes, createEventType, updateEventType, deleteEventType } from "../api/EventsType";
import EventsTypeUi from "@/components/atoms/EventsType";

export default function EventsType() {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEventTypes();
  }, []);

  const loadEventTypes = async () => {
    try {
      setLoading(true);
      const res = await getEventTypes({is_active:true});
      
      // Check if res is already the data array or has a data property
      if (Array.isArray(res)) {
        // API returned array directly
        setEventTypes(res);
      } else if (res && Array.isArray(res.data)) {
        // API returned { data: [...] }
        setEventTypes(res.data);
      } else if (res && res.success && Array.isArray(res.data)) {
        // API returned { success: true, data: [...] }
        setEventTypes(res.data);
      } else {
        console.error('Unexpected API response format:', res);
        setEventTypes([]);
      }
    } catch (error) {
      console.error('Error loading event types:', error);
      setEventTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEventType = async (data) => {
    try {
      const res = await createEventType(data);
      
      // Handle different API response formats
      if (res) {
        if (res.id || res.success === true) {
          await loadEventTypes(); // Refresh the list
          return { success: true };
        }
        
        // Check for error in response
        return { 
          success: false, 
          error: res.error || res.message || 'Failed to create event type' 
        };
      }
      
      return { 
        success: false, 
        error: 'No response from server' 
      };
    } catch (error) {
      console.error('Create error:', error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      };
    }
  };

  const handleUpdateEventType = async (id, data) => {
    try {
      const res = await updateEventType(id, data);
      
      // Handle different API response formats
      if (res) {
        if (res.id || res.success === true) {
          await loadEventTypes(); // Refresh the list
          return { success: true };
        }
        
        // Check for error in response
        return { 
          success: false, 
          error: res.error || res.message || 'Failed to update event type' 
        };
      }
      
      return { 
        success: false, 
        error: 'No response from server' 
      };
    } catch (error) {
      console.error('Update error:', error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      };
    }
  };

  const handleDeleteEventType = async (id) => {
    try {
      const res = await deleteEventType(id);
      
      // Handle different API response formats
      if (res) {
        if (res.success === true || res.deleted === true) {
          loadEventTypes(); // refresh list
          return { success: true };
        }
        
        // Check for error in response
        return { 
          success: false, 
          error: res.error || res.message || 'Failed to delete event type' 
        };
      }
      
      return { 
        success: false, 
        error: 'No response from server' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <EventsTypeUi
        eventTypes={eventTypes}
        onCreate={handleCreateEventType}
        onUpdate={handleUpdateEventType}
        onDelete={handleDeleteEventType}
      />
    </div>
  );
}