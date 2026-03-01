import apiClient from "./apiService";
import { RegisterData, LoginData, AuthResponse } from "../types/authtypes";

export const authService = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>("/auth/login", data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser: (): AuthResponse | null => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      const parsed = JSON.parse(userStr);
      if (parsed && parsed.token && parsed.email) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },
};
