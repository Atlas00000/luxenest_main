/**
 * Authentication types
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; avatar?: string | null }) => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

