import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  createDefaultSiteData,
  loadSiteData,
  resetSiteData,
  saveSiteData,
  type AdminBooking,
  type ContactMessage,
  type Facility,
  type PropertyForSale,
  type Room,
  type SiteData,
  type SiteSettings,
} from '../lib/siteStorage';

type SiteDataContextValue = {
  data: SiteData;
  settings: SiteSettings;
  rooms: Room[];
  propertiesForSale: PropertyForSale[];
  facilities: Facility[];
  bookings: AdminBooking[];
  contactMessages: ContactMessage[];
  updateSettings: (patch: Partial<SiteSettings>) => void;
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Omit<Room, 'id'> & { id?: string }) => void;
  updateRoom: (id: string, patch: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  setPropertiesForSale: (items: PropertyForSale[]) => void;
  addPropertyForSale: (item: Omit<PropertyForSale, 'id'> & { id?: string }) => void;
  updatePropertyForSale: (id: string, patch: Partial<PropertyForSale>) => void;
  deletePropertyForSale: (id: string) => void;
  setFacilities: (facilities: Facility[]) => void;
  addFacility: (facility: Omit<Facility, 'id'> & { id?: string }) => void;
  updateFacility: (id: string, patch: Partial<Facility>) => void;
  deleteFacility: (id: string) => void;
  addBooking: (booking: Omit<AdminBooking, 'id' | 'bookedAt'> & { id?: string; bookedAt?: string }) => void;
  updateBooking: (id: string, patch: Partial<AdminBooking>) => void;
  deleteBooking: (id: string) => void;
  addContactMessage: (message: Omit<ContactMessage, 'id' | 'createdAt'>) => void;
  deleteContactMessage: (id: string) => void;
  resetAllData: () => void;
  getRoomById: (id: string) => Room | undefined;
  getPropertyForSaleById: (id: string) => PropertyForSale | undefined;
};

const SiteDataContext = createContext<SiteDataContextValue | undefined>(undefined);

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const SiteDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<SiteData>(() => loadSiteData());
  const dataRef = useRef<SiteData>(data);

  const persist = useCallback((updater: (prev: SiteData) => SiteData) => {
    const next = updater(dataRef.current);
    dataRef.current = next;
    setData(next);
    saveSiteData(next);
  }, []);

  useEffect(() => {
    const onUpdate = () => {
      const next = loadSiteData();
      dataRef.current = next;
      setData(next);
    };
    window.addEventListener('site-data-updated', onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener('site-data-updated', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<SiteSettings>) => {
      persist((prev) => ({ ...prev, settings: { ...prev.settings, ...patch } }));
    },
    [persist]
  );

  const setRooms = useCallback((rooms: Room[]) => persist((prev) => ({ ...prev, rooms })), [persist]);

  const addRoom = useCallback(
    (room: Omit<Room, 'id'> & { id?: string }) => {
      const id = room.id ?? newId();
      persist((prev) => ({
        ...prev,
        rooms: [...prev.rooms, { ...room, id } as Room],
      }));
    },
    [persist]
  );

  const updateRoom = useCallback(
    (id: string, patch: Partial<Room>) => {
      persist((prev) => ({
        ...prev,
        rooms: prev.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      }));
    },
    [persist]
  );

  const deleteRoom = useCallback(
    (id: string) => {
      persist((prev) => ({ ...prev, rooms: prev.rooms.filter((r) => r.id !== id) }));
    },
    [persist]
  );

  const setPropertiesForSale = useCallback(
    (propertiesForSale: PropertyForSale[]) => persist((prev) => ({ ...prev, propertiesForSale })),
    [persist]
  );

  const addPropertyForSale = useCallback(
    (item: Omit<PropertyForSale, 'id'> & { id?: string }) => {
      const id = item.id ?? `sale-${newId()}`;
      persist((prev) => ({
        ...prev,
        propertiesForSale: [...prev.propertiesForSale, { ...item, id } as PropertyForSale],
      }));
    },
    [persist]
  );

  const updatePropertyForSale = useCallback(
    (id: string, patch: Partial<PropertyForSale>) => {
      persist((prev) => ({
        ...prev,
        propertiesForSale: prev.propertiesForSale.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      }));
    },
    [persist]
  );

  const deletePropertyForSale = useCallback(
    (id: string) => {
      persist((prev) => ({
        ...prev,
        propertiesForSale: prev.propertiesForSale.filter((p) => p.id !== id),
      }));
    },
    [persist]
  );

  const setFacilities = useCallback(
    (facilities: Facility[]) => persist((prev) => ({ ...prev, facilities })),
    [persist]
  );

  const addFacility = useCallback(
    (facility: Omit<Facility, 'id'> & { id?: string }) => {
      const id = facility.id ?? newId();
      persist((prev) => ({
        ...prev,
        facilities: [...prev.facilities, { ...facility, id }],
      }));
    },
    [persist]
  );

  const updateFacility = useCallback(
    (id: string, patch: Partial<Facility>) => {
      persist((prev) => ({
        ...prev,
        facilities: prev.facilities.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      }));
    },
    [persist]
  );

  const deleteFacility = useCallback(
    (id: string) => {
      persist((prev) => ({ ...prev, facilities: prev.facilities.filter((f) => f.id !== id) }));
    },
    [persist]
  );

  const addBooking = useCallback(
    (booking: Omit<AdminBooking, 'id' | 'bookedAt'> & { id?: string; bookedAt?: string }) => {
      const id = booking.id ?? newId();
      const bookedAt = booking.bookedAt ?? new Date().toISOString().slice(0, 10);
      persist((prev) => ({
        ...prev,
        bookings: [{ ...booking, id, bookedAt } as AdminBooking, ...prev.bookings],
      }));
    },
    [persist]
  );

  const updateBooking = useCallback(
    (id: string, patch: Partial<AdminBooking>) => {
      persist((prev) => ({
        ...prev,
        bookings: prev.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      }));
    },
    [persist]
  );

  const deleteBooking = useCallback(
    (id: string) => {
      persist((prev) => ({ ...prev, bookings: prev.bookings.filter((b) => b.id !== id) }));
    },
    [persist]
  );

  const addContactMessage = useCallback(
    (message: Omit<ContactMessage, 'id' | 'createdAt'>) => {
      persist((prev) => ({
        ...prev,
        contactMessages: [
          {
            ...message,
            id: newId(),
            createdAt: new Date().toISOString(),
          },
          ...prev.contactMessages,
        ],
      }));
    },
    [persist]
  );

  const deleteContactMessage = useCallback(
    (id: string) => {
      persist((prev) => ({
        ...prev,
        contactMessages: prev.contactMessages.filter((m) => m.id !== id),
      }));
    },
    [persist]
  );

  const resetAllData = useCallback(() => {
    const next = resetSiteData();
    dataRef.current = next;
    setData(next);
  }, []);

  const getRoomById = useCallback((id: string) => data.rooms.find((r) => r.id === id), [data.rooms]);

  const getPropertyForSaleById = useCallback(
    (id: string) => data.propertiesForSale.find((p) => p.id === id),
    [data.propertiesForSale]
  );

  const value = useMemo<SiteDataContextValue>(
    () => ({
      data,
      settings: data.settings,
      rooms: data.rooms,
      propertiesForSale: data.propertiesForSale,
      facilities: data.facilities,
      bookings: data.bookings,
      contactMessages: data.contactMessages,
      updateSettings,
      setRooms,
      addRoom,
      updateRoom,
      deleteRoom,
      setPropertiesForSale,
      addPropertyForSale,
      updatePropertyForSale,
      deletePropertyForSale,
      setFacilities,
      addFacility,
      updateFacility,
      deleteFacility,
      addBooking,
      updateBooking,
      deleteBooking,
      addContactMessage,
      deleteContactMessage,
      resetAllData,
      getRoomById,
      getPropertyForSaleById,
    }),
    [
      data,
      updateSettings,
      setRooms,
      addRoom,
      updateRoom,
      deleteRoom,
      setPropertiesForSale,
      addPropertyForSale,
      updatePropertyForSale,
      deletePropertyForSale,
      setFacilities,
      addFacility,
      updateFacility,
      deleteFacility,
      addBooking,
      updateBooking,
      deleteBooking,
      addContactMessage,
      deleteContactMessage,
      resetAllData,
      getRoomById,
      getPropertyForSaleById,
    ]
  );

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>;
};

export function useSiteData(): SiteDataContextValue {
  const ctx = useContext(SiteDataContext);
  if (!ctx) {
    throw new Error('useSiteData must be used within SiteDataProvider');
  }
  return ctx;
}

/** Safe defaults when provider is not mounted (should not happen in app). */
export function useSiteDataOptional(): SiteDataContextValue {
  const ctx = useContext(SiteDataContext);
  if (ctx) return ctx;
  const fallback = createDefaultSiteData();
  return {
    data: fallback,
    settings: fallback.settings,
    rooms: fallback.rooms,
    propertiesForSale: fallback.propertiesForSale,
    facilities: fallback.facilities,
    bookings: fallback.bookings,
    contactMessages: fallback.contactMessages,
    updateSettings: () => {},
    setRooms: () => {},
    addRoom: () => {},
    updateRoom: () => {},
    deleteRoom: () => {},
    setPropertiesForSale: () => {},
    addPropertyForSale: () => {},
    updatePropertyForSale: () => {},
    deletePropertyForSale: () => {},
    setFacilities: () => {},
    addFacility: () => {},
    updateFacility: () => {},
    deleteFacility: () => {},
    addBooking: () => {},
    updateBooking: () => {},
    deleteBooking: () => {},
    addContactMessage: () => {},
    deleteContactMessage: () => {},
    resetAllData: () => {},
    getRoomById: (id) => fallback.rooms.find((r) => r.id === id),
    getPropertyForSaleById: (id) => fallback.propertiesForSale.find((p) => p.id === id),
  };
}
