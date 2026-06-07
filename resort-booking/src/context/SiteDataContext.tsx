import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  deleteBlockedDateFromSupabase,
  deleteBookingFromSupabase,
  deleteContactMessageFromSupabase,
  deleteFacilityFromSupabase,
  deletePropertyFromSupabase,
  deleteVillaFromSupabase,
  fetchAdminSiteDataFromSupabase,
  fetchPublicSiteDataFromSupabase,
  insertBlockedDateToSupabase,
  insertBookingToSupabase,
  insertContactMessageToSupabase,
  upsertFacilityToSupabase,
  upsertPropertyToSupabase,
  upsertSiteSettingsToSupabase,
  upsertVillaToSupabase,
  updateBookingInSupabase,
} from '../lib/siteDataSupabase';
import {
  createDefaultSiteData,
  loadSiteData,
  readSessionSiteData,
  resetSiteData,
  saveSiteData,
  writeSessionSiteData,
  type AdminBooking,
  type BlockedDate,
  type ContactMessage,
  type Facility,
  type PropertyForSale,
  type Room,
  type SiteData,
  type SiteSettings,
} from '../lib/siteStorage';

type PaymentMeta = { orderId?: string; paymentId?: string };

export type SiteDataActions = {
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
  addBooking: (
    booking: Omit<AdminBooking, 'id' | 'bookedAt'> & { id?: string; bookedAt?: string },
    payment?: PaymentMeta,
  ) => void;
  updateBooking: (id: string, patch: Partial<AdminBooking>) => void;
  deleteBooking: (id: string) => void;
  blockDates: (block: Omit<BlockedDate, 'id' | 'createdAt' | 'source'> & { source?: 'manual' }) => void;
  deleteBlockedDate: (id: string) => void;
  addContactMessage: (message: Omit<ContactMessage, 'id' | 'createdAt'>) => void;
  deleteContactMessage: (id: string) => void;
  resetAllData: () => void;
  getRoomById: (id: string) => Room | undefined;
  getPropertyForSaleById: (id: string) => PropertyForSale | undefined;
  ensureAdminData: () => void;
  refreshSiteData: () => void;
};

type SiteDataContextValue = SiteDataActions & {
  data: SiteData;
  settings: SiteSettings;
  rooms: Room[];
  propertiesForSale: PropertyForSale[];
  facilities: Facility[];
  bookings: AdminBooking[];
  blockedDates: BlockedDate[];
  contactMessages: ContactMessage[];
  loading: boolean;
  dataSource: 'supabase' | 'local';
};

const SiteDataStateContext = createContext<SiteData | null>(null);
const SiteDataMetaContext = createContext<{ loading: boolean; dataSource: 'supabase' | 'local' } | null>(
  null,
);
const SiteDataActionsContext = createContext<SiteDataActions | null>(null);

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function logRemoteError(label: string, error: unknown) {
  const message =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message: string }).message)
      : String(error);
  console.error(`[Supabase] ${label}:`, message, error);
}

function persistIfLocal(next: SiteData, dataSource: 'supabase' | 'local', silent = false) {
  if (dataSource === 'local') {
    saveSiteData(next, { silent });
  }
}

export const SiteDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [localData, setLocalData] = useState<SiteData>(() => {
    if (!isSupabaseConfigured) return loadSiteData();
    return readSessionSiteData() ?? createDefaultSiteData();
  });
  const hadSessionCache = useRef(Boolean(readSessionSiteData()));
  const [dataSource, setDataSource] = useState<'supabase' | 'local'>(isSupabaseConfigured ? 'supabase' : 'local');
  const [adminLoaded, setAdminLoaded] = useState(false);
  const bookingSyncInFlight = useRef(new Set<string>());

  const publicQuery = useQuery({
    queryKey: ['site-data', 'public'],
    queryFn: fetchPublicSiteDataFromSupabase,
    enabled: isSupabaseConfigured,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const adminQuery = useQuery({
    queryKey: ['site-data', 'admin'],
    queryFn: fetchAdminSiteDataFromSupabase,
    enabled: isSupabaseConfigured && adminLoaded,
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    if (publicQuery.isSuccess && publicQuery.data) {
      setDataSource('supabase');
      setLocalData((prev) => {
        const next = {
          ...publicQuery.data!,
          contactMessages: adminQuery.data?.contactMessages ?? prev.contactMessages,
          bookings: adminQuery.data?.bookings ?? publicQuery.data!.bookings,
        };
        writeSessionSiteData(next);
        hadSessionCache.current = true;
        return next;
      });
    }
    if (publicQuery.isError) {
      setDataSource('local');
      setLocalData(loadSiteData());
    }
  }, [
    publicQuery.isSuccess,
    publicQuery.isError,
    publicQuery.data,
    adminQuery.isSuccess,
    adminQuery.data,
  ]);

  useEffect(() => {
    if (!isSupabaseConfigured || dataSource !== 'local') return;
    const onUpdate = () => setLocalData(loadSiteData());
    window.addEventListener('site-data-updated', onUpdate);
    window.addEventListener('storage', onUpdate);
    return () => {
      window.removeEventListener('site-data-updated', onUpdate);
      window.removeEventListener('storage', onUpdate);
    };
  }, [dataSource]);

  const data = localData;
  const loading =
    isSupabaseConfigured &&
    publicQuery.isLoading &&
    !hadSessionCache.current &&
    !publicQuery.data;

  const patchData = useCallback(
    (updater: (prev: SiteData) => SiteData, options?: { silent?: boolean }) => {
      setLocalData((prev) => {
        const next = updater(prev);
        persistIfLocal(next, dataSource, options?.silent);
        return next;
      });
    },
    [dataSource],
  );

  const ensureAdminData = useCallback(() => {
    if (!adminLoaded) setAdminLoaded(true);
    else void queryClient.invalidateQueries({ queryKey: ['site-data', 'admin'] });
  }, [adminLoaded, queryClient]);

  const refreshSiteData = useCallback(() => {
    if (isSupabaseConfigured) {
      void queryClient.invalidateQueries({ queryKey: ['site-data'] });
      return;
    }
    setLocalData(loadSiteData());
  }, [queryClient]);

  const updateSettings = useCallback(
    (patch: Partial<SiteSettings>) => {
      patchData((prev) => {
        const settings = { ...prev.settings, ...patch };
        if (dataSource === 'supabase') {
          upsertSiteSettingsToSupabase(settings).catch((e) => logRemoteError('updateSettings', e));
        }
        return { ...prev, settings };
      });
    },
    [patchData, dataSource],
  );

  const setRooms = useCallback(
    (rooms: Room[]) => {
      patchData((prev) => ({ ...prev, rooms }));
      if (dataSource === 'supabase') {
        Promise.all(rooms.map((r) => upsertVillaToSupabase(r))).catch((e) => logRemoteError('setRooms', e));
      }
    },
    [patchData, dataSource],
  );

  const addRoom = useCallback(
    (room: Omit<Room, 'id'> & { id?: string }) => {
      const id = room.id ?? newId();
      const full = { ...room, id } as Room;
      patchData((prev) => ({ ...prev, rooms: [...prev.rooms, full] }));
      if (dataSource === 'supabase') {
        upsertVillaToSupabase(full).catch((e) => logRemoteError('addRoom', e));
      }
    },
    [patchData, dataSource],
  );

  const updateRoom = useCallback(
    (id: string, patch: Partial<Room>) => {
      patchData((prev) => {
        const rooms = prev.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r));
        const updated = rooms.find((r) => r.id === id);
        if (dataSource === 'supabase' && updated) {
          upsertVillaToSupabase(updated).catch((e) => logRemoteError('updateRoom', e));
        }
        return { ...prev, rooms };
      });
    },
    [patchData, dataSource],
  );

  const deleteRoom = useCallback(
    (id: string) => {
      patchData((prev) => ({ ...prev, rooms: prev.rooms.filter((r) => r.id !== id) }));
      if (dataSource === 'supabase') {
        deleteVillaFromSupabase(id).catch((e) => logRemoteError('deleteRoom', e));
      }
    },
    [patchData, dataSource],
  );

  const setPropertiesForSale = useCallback(
    (propertiesForSale: PropertyForSale[]) => {
      patchData((prev) => ({ ...prev, propertiesForSale }));
      if (dataSource === 'supabase') {
        Promise.all(propertiesForSale.map((p) => upsertPropertyToSupabase(p))).catch((e) =>
          logRemoteError('setPropertiesForSale', e),
        );
      }
    },
    [patchData, dataSource],
  );

  const addPropertyForSale = useCallback(
    (item: Omit<PropertyForSale, 'id'> & { id?: string }) => {
      const id = item.id ?? `sale-${newId()}`;
      const full = { ...item, id } as PropertyForSale;
      patchData((prev) => ({ ...prev, propertiesForSale: [...prev.propertiesForSale, full] }));
      if (dataSource === 'supabase') {
        upsertPropertyToSupabase(full).catch((e) => logRemoteError('addPropertyForSale', e));
      }
    },
    [patchData, dataSource],
  );

  const updatePropertyForSale = useCallback(
    (id: string, patch: Partial<PropertyForSale>) => {
      patchData((prev) => {
        const propertiesForSale = prev.propertiesForSale.map((p) => (p.id === id ? { ...p, ...patch } : p));
        const updated = propertiesForSale.find((p) => p.id === id);
        if (dataSource === 'supabase' && updated) {
          upsertPropertyToSupabase(updated).catch((e) => logRemoteError('updatePropertyForSale', e));
        }
        return { ...prev, propertiesForSale };
      });
    },
    [patchData, dataSource],
  );

  const deletePropertyForSale = useCallback(
    (id: string) => {
      patchData((prev) => ({
        ...prev,
        propertiesForSale: prev.propertiesForSale.filter((p) => p.id !== id),
      }));
      if (dataSource === 'supabase') {
        deletePropertyFromSupabase(id).catch((e) => logRemoteError('deletePropertyForSale', e));
      }
    },
    [patchData, dataSource],
  );

  const setFacilities = useCallback(
    (facilities: Facility[]) => {
      patchData((prev) => ({ ...prev, facilities }));
      if (dataSource === 'supabase') {
        Promise.all(facilities.map((f) => upsertFacilityToSupabase(f))).catch((e) =>
          logRemoteError('setFacilities', e),
        );
      }
    },
    [patchData, dataSource],
  );

  const addFacility = useCallback(
    (facility: Omit<Facility, 'id'> & { id?: string }) => {
      const id = facility.id ?? newId();
      const full: Facility = { ...facility, id };
      patchData((prev) => ({ ...prev, facilities: [...prev.facilities, full] }));
      if (dataSource === 'supabase') {
        upsertFacilityToSupabase(full).catch((e) => logRemoteError('addFacility', e));
      }
    },
    [patchData, dataSource],
  );

  const updateFacility = useCallback(
    (id: string, patch: Partial<Facility>) => {
      patchData((prev) => {
        const facilities = prev.facilities.map((f) => (f.id === id ? { ...f, ...patch } : f));
        const updated = facilities.find((f) => f.id === id);
        if (dataSource === 'supabase' && updated) {
          upsertFacilityToSupabase(updated).catch((e) => logRemoteError('updateFacility', e));
        }
        return { ...prev, facilities };
      });
    },
    [patchData, dataSource],
  );

  const deleteFacility = useCallback(
    (id: string) => {
      patchData((prev) => ({ ...prev, facilities: prev.facilities.filter((f) => f.id !== id) }));
      if (dataSource === 'supabase') {
        deleteFacilityFromSupabase(id).catch((e) => logRemoteError('deleteFacility', e));
      }
    },
    [patchData, dataSource],
  );

  const syncBookingToSupabase = useCallback(
    (full: AdminBooking, payment?: PaymentMeta) => {
      if (dataSource !== 'supabase' || bookingSyncInFlight.current.has(full.bookingRef)) return;
      bookingSyncInFlight.current.add(full.bookingRef);

      insertBookingToSupabase(full, payment)
        .then((dbId) => {
          if (!dbId) return;
          patchData(
            (current) => ({
              ...current,
              bookings: current.bookings.map((b) =>
                b.bookingRef === full.bookingRef ? { ...b, id: dbId } : b,
              ),
            }),
            { silent: true },
          );
        })
        .catch((e) => logRemoteError('addBooking', e))
        .finally(() => bookingSyncInFlight.current.delete(full.bookingRef));
    },
    [dataSource, patchData],
  );

  const addBooking = useCallback(
    (
      booking: Omit<AdminBooking, 'id' | 'bookedAt'> & { id?: string; bookedAt?: string },
      payment?: PaymentMeta,
    ) => {
      const id = booking.id ?? newId();
      const bookedAt = booking.bookedAt ?? new Date().toISOString().slice(0, 10);
      const full = { ...booking, id, bookedAt } as AdminBooking;

      let shouldSync = false;
      patchData((prev) => {
        const stayKey = `${booking.guestEmail}|${booking.roomId}|${booking.checkIn}|${booking.checkOut}`;
        const isDuplicate = prev.bookings.some(
          (b) =>
            (booking.bookingRef && b.bookingRef === booking.bookingRef) ||
            `${b.guestEmail}|${b.roomId}|${b.checkIn}|${b.checkOut}` === stayKey,
        );
        if (isDuplicate) return prev;
        shouldSync = true;
        return { ...prev, bookings: [full, ...prev.bookings] };
      });

      if (shouldSync) syncBookingToSupabase(full, payment);
    },
    [patchData, syncBookingToSupabase],
  );

  const updateBooking = useCallback(
    (id: string, patch: Partial<AdminBooking>) => {
      patchData((prev) => {
        const bookings = prev.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b));
        if (dataSource === 'supabase') {
          updateBookingInSupabase(id, patch).catch((e) => logRemoteError('updateBooking', e));
        }
        return { ...prev, bookings };
      });
    },
    [patchData, dataSource],
  );

  const deleteBooking = useCallback(
    (id: string) => {
      patchData((prev) => ({ ...prev, bookings: prev.bookings.filter((b) => b.id !== id) }));
      if (dataSource === 'supabase') {
        deleteBookingFromSupabase(id).catch((e) => logRemoteError('deleteBooking', e));
      }
    },
    [patchData, dataSource],
  );

  const blockDates = useCallback(
    (block: Omit<BlockedDate, 'id' | 'createdAt' | 'source'> & { source?: 'manual' }) => {
      const optimistic: BlockedDate = {
        ...block,
        id: newId(),
        source: 'manual',
        createdAt: new Date().toISOString(),
      };

      patchData((prev) => ({ ...prev, blockedDates: [...prev.blockedDates, optimistic] }));

      if (dataSource === 'supabase') {
        insertBlockedDateToSupabase(optimistic)
          .then((saved) => {
            patchData(
              (prev) => ({
                ...prev,
                blockedDates: prev.blockedDates.map((b) =>
                  b.id === optimistic.id ? saved : b,
                ),
              }),
              { silent: true },
            );
          })
          .catch((e) => {
            logRemoteError('blockDates', e);
            patchData((prev) => ({
              ...prev,
              blockedDates: prev.blockedDates.filter((b) => b.id !== optimistic.id),
            }));
          });
      }
    },
    [patchData, dataSource],
  );

  const deleteBlockedDate = useCallback(
    (id: string) => {
      patchData((prev) => ({ ...prev, blockedDates: prev.blockedDates.filter((b) => b.id !== id) }));
      if (dataSource === 'supabase') {
        deleteBlockedDateFromSupabase(id).catch((e) => logRemoteError('deleteBlockedDate', e));
      }
    },
    [patchData, dataSource],
  );

  const addContactMessage = useCallback(
    (message: Omit<ContactMessage, 'id' | 'createdAt'>) => {
      const optimistic: ContactMessage = {
        ...message,
        id: newId(),
        createdAt: new Date().toISOString(),
      };

      patchData((prev) => ({ ...prev, contactMessages: [optimistic, ...prev.contactMessages] }));

      if (dataSource === 'supabase') {
        insertContactMessageToSupabase(optimistic)
          .then((saved) => {
            patchData(
              (prev) => ({
                ...prev,
                contactMessages: prev.contactMessages.map((m) =>
                  m.id === optimistic.id ? saved : m,
                ),
              }),
              { silent: true },
            );
          })
          .catch((e) => logRemoteError('addContactMessage', e));
      }
    },
    [patchData, dataSource],
  );

  const deleteContactMessage = useCallback(
    (id: string) => {
      patchData((prev) => ({
        ...prev,
        contactMessages: prev.contactMessages.filter((m) => m.id !== id),
      }));
      if (dataSource === 'supabase') {
        deleteContactMessageFromSupabase(id).catch((e) => logRemoteError('deleteContactMessage', e));
      }
    },
    [patchData, dataSource],
  );

  const resetAllData = useCallback(() => {
    setDataSource('local');
    const reset = resetSiteData();
    setLocalData(reset);
  }, []);

  const getRoomById = useCallback((id: string) => data.rooms.find((r) => r.id === id), [data.rooms]);

  const getPropertyForSaleById = useCallback(
    (id: string) => data.propertiesForSale.find((p) => p.id === id),
    [data.propertiesForSale],
  );

  const actions = useMemo<SiteDataActions>(
    () => ({
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
      blockDates,
      deleteBlockedDate,
      addContactMessage,
      deleteContactMessage,
      resetAllData,
      getRoomById,
      getPropertyForSaleById,
      ensureAdminData,
      refreshSiteData,
    }),
    [
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
      blockDates,
      deleteBlockedDate,
      addContactMessage,
      deleteContactMessage,
      resetAllData,
      getRoomById,
      getPropertyForSaleById,
      ensureAdminData,
      refreshSiteData,
    ],
  );

  const meta = useMemo(() => ({ loading, dataSource }), [loading, dataSource]);

  return (
    <SiteDataStateContext.Provider value={data}>
      <SiteDataMetaContext.Provider value={meta}>
        <SiteDataActionsContext.Provider value={actions}>
          {children}
          {loading && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/85 text-gray-900">
              Loading site data…
            </div>
          )}
        </SiteDataActionsContext.Provider>
      </SiteDataMetaContext.Provider>
    </SiteDataStateContext.Provider>
  );
};

function useSiteDataState(): SiteData {
  const data = useContext(SiteDataStateContext);
  if (!data) throw new Error('useSiteData must be used within SiteDataProvider');
  return data;
}

function useSiteDataActions(): SiteDataActions {
  const actions = useContext(SiteDataActionsContext);
  if (!actions) throw new Error('useSiteData must be used within SiteDataProvider');
  return actions;
}

export function useSiteSettings(): SiteSettings {
  return useSiteDataState().settings;
}

export function useSiteBookings(): { bookings: AdminBooking[]; blockedDates: BlockedDate[] } {
  const data = useSiteDataState();
  return useMemo(
    () => ({ bookings: data.bookings, blockedDates: data.blockedDates }),
    [data.bookings, data.blockedDates],
  );
}

export function useSiteCatalog(): {
  rooms: Room[];
  propertiesForSale: PropertyForSale[];
  facilities: Facility[];
} {
  const data = useSiteDataState();
  return useMemo(
    () => ({
      rooms: data.rooms,
      propertiesForSale: data.propertiesForSale,
      facilities: data.facilities,
    }),
    [data.rooms, data.propertiesForSale, data.facilities],
  );
}

export function useSiteData(): SiteDataContextValue {
  const data = useSiteDataState();
  const meta = useContext(SiteDataMetaContext);
  const actions = useSiteDataActions();
  if (!meta) throw new Error('useSiteData must be used within SiteDataProvider');

  return useMemo(
    () => ({
      data,
      settings: data.settings,
      rooms: data.rooms,
      propertiesForSale: data.propertiesForSale,
      facilities: data.facilities,
      bookings: data.bookings,
      blockedDates: data.blockedDates,
      contactMessages: data.contactMessages,
      loading: meta.loading,
      dataSource: meta.dataSource,
      ...actions,
    }),
    [data, meta, actions],
  );
}

export function useSiteDataOptional(): SiteDataContextValue {
  const data = useContext(SiteDataStateContext);
  const meta = useContext(SiteDataMetaContext);
  const actions = useContext(SiteDataActionsContext);
  if (data && meta && actions) {
    return {
      data,
      settings: data.settings,
      rooms: data.rooms,
      propertiesForSale: data.propertiesForSale,
      facilities: data.facilities,
      bookings: data.bookings,
      blockedDates: data.blockedDates,
      contactMessages: data.contactMessages,
      loading: meta.loading,
      dataSource: meta.dataSource,
      ...actions,
    };
  }

  const fallback = createDefaultSiteData();
  const noop = () => {};
  return {
    data: fallback,
    settings: fallback.settings,
    rooms: fallback.rooms,
    propertiesForSale: fallback.propertiesForSale,
    facilities: fallback.facilities,
    bookings: fallback.bookings,
    blockedDates: fallback.blockedDates,
    contactMessages: fallback.contactMessages,
    loading: false,
    dataSource: 'local',
    updateSettings: noop,
    setRooms: noop,
    addRoom: noop,
    updateRoom: noop,
    deleteRoom: noop,
    setPropertiesForSale: noop,
    addPropertyForSale: noop,
    updatePropertyForSale: noop,
    deletePropertyForSale: noop,
    setFacilities: noop,
    addFacility: noop,
    updateFacility: noop,
    deleteFacility: noop,
    addBooking: noop,
    updateBooking: noop,
    deleteBooking: noop,
    blockDates: noop,
    deleteBlockedDate: noop,
    addContactMessage: noop,
    deleteContactMessage: noop,
    resetAllData: noop,
    getRoomById: (id) => fallback.rooms.find((r) => r.id === id),
    getPropertyForSaleById: (id) => fallback.propertiesForSale.find((p) => p.id === id),
    ensureAdminData: noop,
    refreshSiteData: noop,
  };
}
