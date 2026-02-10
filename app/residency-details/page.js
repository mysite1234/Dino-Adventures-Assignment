"use client";

import { useEffect, useState } from "react";
import { getResidencies, createResidency, updateResidency,deleteResidency } from "../api/Residencies";
import ResidencyDetails from "@/components/atoms/ResidencyDetails";

export default function ResidencyPage() {
  const [residencies, setResidencies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResidencies();
  }, []);

  const loadResidencies = async () => {
    try {
      setLoading(true);
      const res = await getResidencies();
      if (res.success) {
        setResidencies(res.data);
      } else {
        console.error('Failed to load residencies:', res.error);
      }
    } catch (error) {
      console.error('Error loading residencies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResidency = async (data) => {
    try {
      const res = await createResidency(data);
      
      // Check if the response has success property
      if (res && res.success) {
        await loadResidencies(); // Refresh the list
        return { success: true };
      } else {
        // If the response doesn't have a success property, check for other indicators
        if (res && res.id) {
          await loadResidencies();
          return { success: true };
        }
        return { 
          success: false, 
          error: res?.error || res?.message || 'Failed to create residency' 
        };
      }
    } catch (error) {
      console.error('Create error:', error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      };
    }
  };

  const handleUpdateResidency = async (id, data) => {
    try {
      const res = await updateResidency(id, data);
      console.log('res residency:',res);

      
      // Check if the response has success property
      if (res && res.success) {
        await loadResidencies(); // Refresh the list
        return { success: true };
      } else {
        // If the response doesn't have a success property, check for other indicators
        if (res && res.id) {
          await loadResidencies();
          return { success: true };
        }
        return { 
          success: false, 
          error: res?.error || res?.message || 'Failed to update residency' 
        };
      }
    } catch (error) {
      console.error('Update error:', error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      };
    }
  };

  const handleDeleteResidency = async (id) => {
    try {
      const res = await deleteResidency(id);
      if (res.success) {
        loadResidencies(); // refresh list
        return { success: true };
      }
      return { success: false, error: "Failed to delete" };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ResidencyDetails 
        residencies={residencies}
        onCreate={handleCreateResidency}
        onUpdate={handleUpdateResidency}
        onDelete={handleDeleteResidency}
      />
    </div>
  );
}