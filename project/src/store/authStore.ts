import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  users: User[];
  login: (email: string, password: string) => { success: boolean; message: string };
  signup: (user: Omit<User, 'id'>) => { success: boolean; message: string };
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      users: [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'admin123',
          role: 'admin',
          avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
        },
        {
          id: '2',
          name: 'Employee User',
          email: 'employee@example.com',
          password: 'employee123',
          role: 'employee',
          avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
        },
      ],
      login: (email, password) => {
        const { users } = get();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
          set({ user, isAuthenticated: true });
          return { success: true, message: 'Login successful!' };
        }

        return { success: false, message: 'Invalid email or password.' };
      },
      signup: (userData) => {
        const { users } = get();
        const existingUser = users.find(u => u.email === userData.email);

        if (existingUser) {
          return { success: false, message: 'Email already in use.' };
        }

        const newUser = {
          ...userData,
          id: Date.now().toString(),
        };

        set({ users: [...users, newUser] });
        return { success: true, message: 'Sign up successful! You can now log in.' };
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);