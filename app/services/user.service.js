import { apiRequest } from "@/lib/api";

export const getProfile = () => {
  const token = localStorage.getItem("token");

  return apiRequest("/api/users/profile", {
    token,
  });
};
