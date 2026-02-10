import { apiRequest } from "@/lib/api";

/**
 * LOGIN with password
 */
export const login = (payload) =>
  apiRequest("/api/users/login", {
    method: "POST",
    body: payload,
  });

/**
 * REGISTER
 */
export const register = (payload) =>
  apiRequest("/api/users/register", {
    method: "POST",
    body: payload,
  });

/**
 * SEND OTP for login
 */
export const sendOTP = (payload) =>
  apiRequest("/api/users/login/send-otp", {
    method: "POST",
    body: payload,
  });

/**
 * VERIFY OTP
 */
export const verifyOTP = (payload) =>
  apiRequest("/api/users/login/verify-otp", {
    method: "POST",
    body: payload,
  });