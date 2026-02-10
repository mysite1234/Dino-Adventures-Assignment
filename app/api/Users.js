import { apiRequest } from "@/lib/api";

/**
 * POST register user
 */
export const registerUser = async (payload) => {
  return await apiRequest("/api/users/register", {
    method: "POST",
    body: payload,
  });
};

/**
 * POST login user
 */
export const loginUser = async (payload) => {
  return await apiRequest("/api/users/login", {
    method: "POST",
    body: payload,
  });
};
