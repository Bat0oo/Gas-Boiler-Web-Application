export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  role: string;
  userId: number;
}

export interface User {
  userId: number;
  username: string;
  email: string;
  role: string;
}
