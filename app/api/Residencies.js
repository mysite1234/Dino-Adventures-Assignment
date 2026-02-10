import { apiRequest } from "@/lib/api";

/**
 * GET all residencies
 */
export const getResidencies = async () => {
  return await apiRequest("/api/residencies");
};

/**
 * POST create residency
 */
export const createResidency = async (payload) => {
  return await apiRequest("/api/residencies", {
    method: "POST",
    body: payload,
  });
};

/**
 * PUT update residency
 */
export const updateResidency = async (id, payload) => {
  return await apiRequest(`/api/residencies/${id}`, {
    method: "PUT",
    body: payload,
  });
};

/**
 * DELETE residency
 */
export const deleteResidency = async (id) => {
  return await apiRequest(`/api/residencies/${id}`, {
    method: "DELETE",
  });
};
