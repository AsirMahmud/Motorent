'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import { User, Vehicle, Booking, Message } from './types';
import { mockMessages } from './mock-data';
import { mapApiUserToAppUser, type ApiAuthUser } from './map-api-user';
import { mapPublicVehicleApiToVehicle, type PublicVehicleApi } from './map-public-vehicle';

/** Shape returned by GET /api/bookings?scope=renter */
type ApiBooking = {
  id: string;
  vehicleId: string;
  renterId: string;
  startDate: string;
  endDate: string;
  pickupTime?: string;
  totalPrice: number;
  status: string;
  pickupLocation: string;
  dropoffLocation?: string;
  notes?: string;
  createdAt: string;
};

function mapApiBooking(b: ApiBooking): Booking {
  return {
    id: b.id,
    vehicleId: b.vehicleId,
    renterId: b.renterId,
    startDate: new Date(b.startDate),
    endDate: new Date(b.endDate),
    pickupTime: b.pickupTime,
    totalPrice: b.totalPrice,
    status: b.status as Booking['status'],
    pickupLocation: b.pickupLocation,
    dropoffLocation: b.dropoffLocation,
    notes: b.notes,
    createdAt: new Date(b.createdAt),
  };
}

interface AppContextType {
  authReady: boolean;
  vehiclesLoading: boolean;
  bookingsLoading: boolean;
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
  refreshBookings: () => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authReady, setAuthReady] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [users, setUsers] = useState<User[]>([]);

  // Fetch public vehicles (approved listings for the home page map)
  const fetchVehicles = useCallback(async () => {
    setVehiclesLoading(true);
    try {
      const res = await fetch('/api/vehicles/public');
      if (res.ok) {
        const data = await res.json() as { vehicles: PublicVehicleApi[] };
        setVehicles(data.vehicles.map(mapPublicVehicleApiToVehicle));
      }
    } catch {
      // Keep empty on error
    } finally {
      setVehiclesLoading(false);
    }
  }, []);

  // Fetch renter bookings (only when logged in as renter)
  const fetchRenterBookings = useCallback(async () => {
    setBookingsLoading(true);
    try {
      const res = await fetch('/api/bookings?scope=renter', { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json() as { bookings: ApiBooking[] };
        setBookings(data.bookings.map(mapApiBooking));
      }
    } catch {
      // Keep empty on error
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  const refreshBookings = useCallback(async () => {
    if (currentUser?.role === 'renter') {
      await fetchRenterBookings();
    }
  }, [currentUser?.role, fetchRenterBookings]);

  // Auth check on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
        if (res.ok) {
          const data = (await res.json()) as { user: ApiAuthUser };
          if (!cancelled) {
            setCurrentUserState(mapApiUserToAppUser(data.user));
          }
        } else if (!cancelled) {
          const savedUser = localStorage.getItem('currentUser');
          if (savedUser) {
            try {
              const user = JSON.parse(savedUser) as User;
              user.createdAt = new Date(user.createdAt);
              setCurrentUserState(user);
            } catch {
              // ignore parse error
            }
          }
        }
      } catch {
        if (!cancelled) {
          const savedUser = localStorage.getItem('currentUser');
          if (savedUser) {
            try {
              const user = JSON.parse(savedUser) as User;
              user.createdAt = new Date(user.createdAt);
              setCurrentUserState(user);
            } catch {
              // ignore parse error
            }
          }
        }
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Fetch vehicles once on mount
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Fetch renter bookings when user logs in as renter
  useEffect(() => {
    if (authReady && currentUser?.role === 'renter') {
      fetchRenterBookings();
    }
  }, [authReady, currentUser?.role, fetchRenterBookings]);

  // Persist user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const setCurrentUser = (user: User | null) => setCurrentUserState(user);

  const updateUser = (updates: Partial<User>) => {
    if (currentUser) {
      const updated = { ...currentUser, ...updates };
      setCurrentUserState(updated);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    }
  };

  const addBooking = (booking: Booking) => setBookings(prev => [...prev, booking]);

  const updateBooking = (bookingId: string, updates: Partial<Booking>) => {
    setBookings(prev => prev.map((b) => (b.id === bookingId ? { ...b, ...updates } : b)));
  };

  const updateVehicle = (vehicleId: string, updates: Partial<Vehicle>) => {
    setVehicles(prev => prev.map((v) => (v.id === vehicleId ? { ...v, ...updates } : v)));
  };

  const addVehicle = (vehicle: Vehicle) => setVehicles(prev => [...prev, vehicle]);

  const addUser = (user: User) => setUsers(prev => [...prev, user]);

  const updateUserById = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (currentUser?.id === userId) {
      setCurrentUserState(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const addMessage = (message: Message) => setMessages(prev => [...prev, message]);

  const markMessageAsRead = (messageId: string) => {
    setMessages(prev => prev.map((m) => (m.id === messageId ? { ...m, read: true } : m)));
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } catch { /* still clear */ }
    try {
      await signOut({ redirect: false });
    } catch { /* ignore */ }
    setCurrentUserState(null);
    setBookings([]);
    localStorage.removeItem('currentUser');
  };

  return (
    <AppContext.Provider
      value={{
        authReady,
        vehiclesLoading,
        bookingsLoading,
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
        refreshBookings,
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
