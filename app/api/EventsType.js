import { apiRequest } from "@/lib/api";

/**
 * GET all event types
 */
export const getEventTypes = async () => {
  return await apiRequest("/api/event-types");
};

/**
 * GET single event type by ID
 */
export const getEventTypeById = async (id) => {
  return await apiRequest(`/api/event-types/${id}`);
};

/**
 * POST create event type
 */
export const createEventType = async (payload) => {
  return await apiRequest("/api/event-types", {
    method: "POST",
    body: payload,
  });
};

/**
 * PUT update event type
 */
export const updateEventType = async (id, payload) => {
  return await apiRequest(`/api/event-types/${id}`, {
    method: "PUT",
    body: payload,
  });
};

/**
 * DELETE event type (soft delete if backend supports it)
 */
export const deleteEventType = async (id) => {
  return await apiRequest(`/api/event-types/${id}`, {
    method: "DELETE",
  });
};
