'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Vehicle, Booking, Message } from './types';
import { mockUsers, mockVehicles, mockBookings, mockMessages } from './mock-data';

interface AppContextType {
  currentUser: User | null;
  vehicles: Vehicle[];
  bookings: Booking[];
  messages: Message[];
  users: User[];
  setCurrentUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => void;
  updateVehicle: (vehicleId: string, updates: Partial<Vehicle>) => void;
  addVehicle: (vehicle: Vehicle) => void;
  addUser: (user: User) => void;
  updateUserById: (userId: string, updates: Partial<User>) => void;
  addMessage: (message: Message) => void;
  markMessageAsRead: (messageId: string) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [users, setUsers] = useState<User[]>(Object.values(mockUsers));

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        // Rehydrate Date objects
        user.createdAt = new Date(user.createdAt);
        setCurrentUserState(user);
      } catch (error) {
        console.error('Failed to parse saved user:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
  };

  const updateUser = (updates: Partial<User>) => {
    if (currentUser) {
      const updated = { ...currentUser, ...updates };
      setCurrentUserState(updated);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    }
  };

  const addBooking = (booking: Booking) => {
    setBookings(prev => [...prev, booking]);
  };

  const updateBooking = (bookingId: string, updates: Partial<Booking>) => {
    setBookings(prev =>
      prev.map((b) => (b.id === bookingId ? { ...b, ...updates } : b))
    );
  };

  const updateVehicle = (vehicleId: string, updates: Partial<Vehicle>) => {
    setVehicles(prev =>
      prev.map((v) => (v.id === vehicleId ? { ...v, ...updates } : v))
    );
  };

  const addVehicle = (vehicle: Vehicle) => {
    setVehicles(prev => [...prev, vehicle]);
  };

  const addUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const updateUserById = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (currentUser?.id === userId) {
      setCurrentUserState(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const markMessageAsRead = (messageId: string) => {
    setMessages(prev =>
      prev.map((m) => (m.id === messageId ? { ...m, read: true } : m))
    );
  };

  const logout = () => {
    setCurrentUserState(null);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        vehicles,
        bookings,
        messages,
        setCurrentUser,
        updateUser,
        addBooking,
        updateBooking,
        updateVehicle,
        addVehicle,
        addUser,
        updateUserById,
        addMessage,
        markMessageAsRead,
        users,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
