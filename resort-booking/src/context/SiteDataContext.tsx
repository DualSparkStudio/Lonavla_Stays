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
import { notify } from '../lib/notify';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  deleteBlockedDateFromSupabase,
  deleteBookingFromSupabase,
  deleteFacilityFromSupabase,
  deletePropertyFromSupabase,
  deleteVillaFromSupabase,
  fetchAdminSiteDataFromSupabase,
  fetchPublicSiteDataFromSupabase,
  insertBlockedDateToSupabase,
  insertBookingToSupabase,
  upsertFacilityToSupabase,
  upsertPropertyToSupabase,
  upsertSiteSettingsToSupabase,
  upsertVillaToSupabase,
  updateBookingInSupabase,
} from '../lib/siteDataSupabase';
import {
  createEmptyCatalogSiteData,
  purgeLocalSiteData,
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
  error: string | null;
  dataSource: 'supabase';
};

const SiteDataStateContext = createContext<SiteData | null>(null);
const SiteDataMetaContext = createContext<{ loading: boolean; error: string | null; dataSource: 'supabase' } | null>(
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
  if (message.toLowerCase().includes('row-level security') || message.includes('policy')) {
    notify.error(
      `Save blocked by database permissions. Run supabase/rls-cms-policies.sql in Supabase SQL Editor.`,
    );
    return;
  }
  notify.error(`Could not save to database (${label}): ${message}`);
}

function SupabaseRequiredScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md text-center space-y-3">
        <h1 className="text-xl font-bold text-gray-900">Supabase not configured</h1>
        <p className="text-gray-600 text-sm leading-relaxed">
          Set <code className="text-pink-600">VITE_SUPABASE_URL</code> and{' '}
          <code className="text-pink-600">VITE_SUPABASE_ANON_KEY</code> in your environment. Villas,
          listings, and site content load only from Supabase — there is no local demo fallback.
        </p>
      </div>
    </div>
  );
}

export const SiteDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (!isSupabaseConfigured) {
    return <SupabaseRequiredScreen />;
  }
  return <ConnectedSiteDataProvider>{children}</ConnectedSiteDataProvider>;
};

const ConnectedSiteDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const [localData, setLocalData] = useState<SiteData>(() => createEmptyCatalogSiteData());
  const publicDataLoaded = useRef(false);
  const [adminLoaded, setAdminLoaded] = useState(false);
  const bookingSyncInFlight = useRef(new Set<string>());

  useEffect(() => {
    purgeLocalSiteData();
  }, []);

  const publicQuery = useQuery({
    queryKey: ['site-data', 'public'],
    queryFn: fetchPublicSiteDataFromSupabase,
    enabled: isSupabaseConfigured,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
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
    if (publicQuery.isSuccess && publicQuery.data) {
      setLocalData((prev) => ({
        ...publicQuery.data!,
        contactMessages: adminQuery.data?.contactMessages ?? prev.contactMessages,
        bookings: adminQuery.data?.bookings ?? publicQuery.data!.bookings,
      }));
      publicDataLoaded.current = true;
    }
  }, [
    publicQuery.isSuccess,
    publicQuery.isError,
    publicQuery.data,
    adminQuery.isSuccess,
    adminQuery.data,
  ]);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const refreshPublicData = () => {
      void queryClient.invalidateQueries({ queryKey: ['site-data', 'public'] });
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) refreshPublicData();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshPublicData();
    };

    window.addEventListener('pageshow', onPageShow);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('pageshow', onPageShow);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [queryClient]);

  const data = localData;
  const fetchError = publicQuery.isError
    ? publicQuery.error instanceof Error
      ? publicQuery.error.message
      : 'Failed to load site data from Supabase.'
    : null;
  const loading =
    !publicDataLoaded.current && (publicQuery.isLoading || publicQuery.isFetching) && !fetchError;

  const patchData = useCallback((updater: (prev: SiteData) => SiteData) => {
    setLocalData((prev) => updater(prev));
  }, []);

  const ensureAdminData = useCallback(() => {
    if (!adminLoaded) setAdminLoaded(true);
    else void queryClient.invalidateQueries({ queryKey: ['site-data', 'admin'] });
  }, [adminLoaded, queryClient]);

  const refreshSiteData = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['site-data'] });
  }, [queryClient]);

  const syncCatalogWrite = useCallback(
    (label: string, task: () => Promise<void>) => {
      task()
        .then(() => {
          notify.success('Saved to database');
          void queryClient.invalidateQueries({ queryKey: ['site-data', 'public'] });
        })
        .catch((e) => logRemoteError(label, e));
    },
    [queryClient],
  );

  const updateSettings = useCallback(
    (patch: Partial<SiteSettings>) => {
      patchData((prev) => {
        const settings = { ...prev.settings, ...patch };
        upsertSiteSettingsToSupabase(settings)
          .then(() => {
            void queryClient.invalidateQueries({ queryKey: ['site-data', 'public'] });
          })
          .catch((e) => logRemoteError('updateSettings', e));
        return { ...prev, settings };
      });
    },
    [patchData, queryClient],
  );

  const setRooms = useCallback(
    (rooms: Room[]) => {
      patchData((prev) => ({ ...prev, rooms }));
      Promise.all(rooms.map((r) => upsertVillaToSupabase(r))).catch((e) => logRemoteError('setRooms', e));
    },
    [patchData],
  );

  const addRoom = useCallback(
    (room: Omit<Room, 'id'> & { id?: string }) => {
      const id = room.id ?? newId();
      const full = { ...room, id } as Room;
      patchData((prev) => ({ ...prev, rooms: [...prev.rooms, full] }));
      syncCatalogWrite('addRoom', () => upsertVillaToSupabase(full));
    },
    [patchData, syncCatalogWrite],
  );

  const updateRoom = useCallback(
    (id: string, patch: Partial<Room>) => {
      patchData((prev) => {
        const rooms = prev.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r));
        const updated = rooms.find((r) => r.id === id);
        if (updated) {
          syncCatalogWrite('updateRoom', () => upsertVillaToSupabase(updated));
        }
        return { ...prev, rooms };
      });
    },
    [patchData, syncCatalogWrite],
  );

  const deleteRoom = useCallback(
    (id: string) => {
      patchData((prev) => ({ ...prev, rooms: prev.rooms.filter((r) => r.id !== id) }));
      syncCatalogWrite('deleteRoom', () => deleteVillaFromSupabase(id));
    },
    [patchData, syncCatalogWrite],
  );

  const setPropertiesForSale = useCallback(
    (propertiesForSale: PropertyForSale[]) => {
      patchData((prev) => ({ ...prev, propertiesForSale }));
      Promise.all(propertiesForSale.map((p) => upsertPropertyToSupabase(p))).catch((e) =>
        logRemoteError('setPropertiesForSale', e),
      );
    },
    [patchData],
  );

  const addPropertyForSale = useCallback(
    (item: Omit<PropertyForSale, 'id'> & { id?: string }) => {
      const id = item.id ?? `sale-${newId()}`;
      const full = { ...item, id } as PropertyForSale;
      patchData((prev) => ({ ...prev, propertiesForSale: [...prev.propertiesForSale, full] }));
      syncCatalogWrite('addPropertyForSale', () => upsertPropertyToSupabase(full));
    },
    [patchData, syncCatalogWrite],
  );

  const updatePropertyForSale = useCallback(
    (id: string, patch: Partial<PropertyForSale>) => {
      patchData((prev) => {
        const propertiesForSale = prev.propertiesForSale.map((p) => (p.id === id ? { ...p, ...patch } : p));
        const updated = propertiesForSale.find((p) => p.id === id);
        if (updated) {
          syncCatalogWrite('updatePropertyForSale', () => upsertPropertyToSupabase(updated));
        }
        return { ...prev, propertiesForSale };
      });
    },
    [patchData, syncCatalogWrite],
  );

  const deletePropertyForSale = useCallback(
    (id: string) => {
      patchData((prev) => ({
        ...prev,
        propertiesForSale: prev.propertiesForSale.filter((p) => p.id !== id),
      }));
      syncCatalogWrite('deletePropertyForSale', () => deletePropertyFromSupabase(id));
    },
    [patchData, syncCatalogWrite],
  );

  const setFacilities = useCallback(
    (facilities: Facility[]) => {
      patchData((prev) => ({ ...prev, facilities }));
      Promise.all(facilities.map((f) => upsertFacilityToSupabase(f))).catch((e) =>
        logRemoteError('setFacilities', e),
      );
    },
    [patchData],
  );

  const addFacility = useCallback(
    (facility: Omit<Facility, 'id'> & { id?: string }) => {
      const id = facility.id ?? newId();
      const full: Facility = { ...facility, id };
      patchData((prev) => ({ ...prev, facilities: [...prev.facilities, full] }));
      upsertFacilityToSupabase(full).catch((e) => logRemoteError('addFacility', e));
    },
    [patchData],
  );

  const updateFacility = useCallback(
    (id: string, patch: Partial<Facility>) => {
      patchData((prev) => {
        const facilities = prev.facilities.map((f) => (f.id === id ? { ...f, ...patch } : f));
        const updated = facilities.find((f) => f.id === id);
        if (updated) {
          upsertFacilityToSupabase(updated).catch((e) => logRemoteError('updateFacility', e));
        }
        return { ...prev, facilities };
      });
    },
    [patchData],
  );

  const deleteFacility = useCallback(
    (id: string) => {
      patchData((prev) => ({ ...prev, facilities: prev.facilities.filter((f) => f.id !== id) }));
      deleteFacilityFromSupabase(id).catch((e) => logRemoteError('deleteFacility', e));
    },
    [patchData],
  );

  const syncBookingToSupabase = useCallback(
    (full: AdminBooking, payment?: PaymentMeta) => {
      if (bookingSyncInFlight.current.has(full.bookingRef)) return;
      bookingSyncInFlight.current.add(full.bookingRef);

      insertBookingToSupabase(full, payment)
        .then((dbId) => {
          if (!dbId) return;
          patchData((current) => ({
            ...current,
            bookings: current.bookings.map((b) =>
              b.bookingRef === full.bookingRef ? { ...b, id: dbId } : b,
            ),
          }));
        })
        .catch((e) => logRemoteError('addBooking', e))
        .finally(() => bookingSyncInFlight.current.delete(full.bookingRef));
    },
    [patchData],
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
        updateBookingInSupabase(id, patch).catch((e) => logRemoteError('updateBooking', e));
        return { ...prev, bookings };
      });
    },
    [patchData],
  );

  const deleteBooking = useCallback(
    (id: string) => {
      patchData((prev) => ({ ...prev, bookings: prev.bookings.filter((b) => b.id !== id) }));
      deleteBookingFromSupabase(id).catch((e) => logRemoteError('deleteBooking', e));
    },
    [patchData],
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

      insertBlockedDateToSupabase(optimistic)
        .then((saved) => {
          patchData((prev) => ({
            ...prev,
            blockedDates: prev.blockedDates.map((b) => (b.id === optimistic.id ? saved : b)),
          }));
        })
        .catch((e) => {
          logRemoteError('blockDates', e);
          patchData((prev) => ({
            ...prev,
            blockedDates: prev.blockedDates.filter((b) => b.id !== optimistic.id),
          }));
        });
    },
    [patchData],
  );

  const deleteBlockedDate = useCallback(
    (id: string) => {
      patchData((prev) => ({ ...prev, blockedDates: prev.blockedDates.filter((b) => b.id !== id) }));
      deleteBlockedDateFromSupabase(id).catch((e) => logRemoteError('deleteBlockedDate', e));
    },
    [patchData],
  );

  const resetAllData = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['site-data'] });
  }, [queryClient]);

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
      resetAllData,
      getRoomById,
      getPropertyForSaleById,
      ensureAdminData,
      refreshSiteData,
    ],
  );

  const meta = useMemo(
    () => ({ loading, error: fetchError, dataSource: 'supabase' as const }),
    [loading, fetchError],
  );

  return (
    <SiteDataStateContext.Provider value={data}>
      <SiteDataMetaContext.Provider value={meta}>
        <SiteDataActionsContext.Provider value={actions}>
          {children}
          {fetchError && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 px-4">
              <div className="max-w-lg text-center space-y-4">
                <p className="text-gray-900 font-semibold">Could not load site data</p>
                <p className="text-sm text-gray-600 text-left whitespace-pre-wrap">{fetchError}</p>
                {(fetchError.includes('schema cache') ||
                  fetchError.includes('does not exist') ||
                  fetchError.includes('relationship')) && (
                  <div className="text-left text-sm text-gray-700 bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                    <p className="font-semibold text-amber-900">Database not set up yet</p>
                    <p>
                      In Supabase Dashboard, open the project that matches{' '}
                      <code className="text-pink-600">VITE_SUPABASE_URL</code>, then SQL Editor → run{' '}
                      <code className="text-pink-600">supabase/install-fresh.sql</code> (entire file).
                      Then run <code className="text-pink-600">supabase/verify-schema.sql</code> to confirm.
                    </p>
                    <p>
                      On Netlify, update env vars to the same project URL/key and redeploy (VITE_ vars are
                      baked in at build time).
                    </p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => void queryClient.invalidateQueries({ queryKey: ['site-data', 'public'] })}
                  className="rounded-lg bg-[#FF385C] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E31C5F]"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
          {loading && !fetchError && (
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
      error: meta.error,
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
      error: meta.error,
      dataSource: meta.dataSource,
      ...actions,
    };
  }

  const fallback = createEmptyCatalogSiteData();
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
    loading: true,
    error: null,
    dataSource: 'supabase',
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
    resetAllData: noop,
    getRoomById: (id) => fallback.rooms.find((r) => r.id === id),
    getPropertyForSaleById: (id) => fallback.propertiesForSale.find((p) => p.id === id),
    ensureAdminData: noop,
    refreshSiteData: noop,
  };
}
