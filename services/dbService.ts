
import { Tenant, Room, ElectricityReading, AdditionalService, DbStore } from '../types';

const DB_NAME = 'TenantRoomManagementDB';
const DB_VERSION = 1;

interface MyDB extends IDBDatabase {
    createObjectStore(name: DbStore, options?: IDBObjectStoreParameters): IDBObjectStore;
}

const openDB = (): Promise<MyDB> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result as MyDB;
      if (!db.objectStoreNames.contains(DbStore.TENANTS)) {
        db.createObjectStore(DbStore.TENANTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(DbStore.ROOMS)) {
        db.createObjectStore(DbStore.ROOMS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(DbStore.ELECTRICITY_READINGS)) {
        const electricityStore = db.createObjectStore(DbStore.ELECTRICITY_READINGS, { keyPath: 'id' });
        electricityStore.createIndex('tenantId', 'tenantId', { unique: false });
        electricityStore.createIndex('roomId', 'roomId', { unique: false });
      }
      if (!db.objectStoreNames.contains(DbStore.ADDITIONAL_SERVICES)) {
        const servicesStore = db.createObjectStore(DbStore.ADDITIONAL_SERVICES, { keyPath: 'id' });
        servicesStore.createIndex('tenantId', 'tenantId', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result as MyDB);
    };

    request.onerror = (event) => {
      reject(`Database error: ${(event.target as IDBOpenDBRequest).error}`);
    };
  });
};

const getStore = <T,>(db: MyDB, storeName: DbStore, mode: IDBTransactionMode): IDBObjectStore => {
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
};

// Generic CRUD operations
const addItem = async <T extends { id: string }>(storeName: DbStore, item: T): Promise<T> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const store = getStore(db, storeName, 'readwrite');
    const request = store.add(item);
    request.onsuccess = () => resolve(item);
    request.onerror = (event) => reject(`Add item error: ${(event.target as IDBRequest).error}`);
  });
};

const getItem = async <T,>(storeName: DbStore, id: string): Promise<T | undefined> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const store = getStore(db, storeName, 'readonly');
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result as T);
    request.onerror = (event) => reject(`Get item error: ${(event.target as IDBRequest).error}`);
  });
};

const getAllItems = async <T,>(storeName: DbStore): Promise<T[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const store = getStore(db, storeName, 'readonly');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result as T[]);
    request.onerror = (event) => reject(`Get all items error: ${(event.target as IDBRequest).error}`);
  });
};

const updateItem = async <T extends { id: string }>(storeName: DbStore, item: T): Promise<T> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const store = getStore(db, storeName, 'readwrite');
    const request = store.put(item);
    request.onsuccess = () => resolve(item);
    request.onerror = (event) => reject(`Update item error: ${(event.target as IDBRequest).error}`);
  });
};

const deleteItem = async (storeName: DbStore, id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const store = getStore(db, storeName, 'readwrite');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(`Delete item error: ${(event.target as IDBRequest).error}`);
  });
};

const getItemsByIndex = async <T,>(storeName: DbStore, indexName: string, query: IDBValidKey | IDBKeyRange): Promise<T[]> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(query);

        request.onsuccess = () => {
            resolve(request.result as T[]);
        };
        request.onerror = (event) => {
            reject(`Error fetching items by index: ${(event.target as IDBRequest).error}`);
        };
    });
};


export const dbService = {
  // Tenant operations
  addTenant: (tenant: Tenant) => addItem<Tenant>(DbStore.TENANTS, tenant),
  getTenant: (id: string) => getItem<Tenant>(DbStore.TENANTS, id),
  getAllTenants: () => getAllItems<Tenant>(DbStore.TENANTS),
  updateTenant: (tenant: Tenant) => updateItem<Tenant>(DbStore.TENANTS, tenant),
  deleteTenant: async (id: string) => {
    // Also delete associated readings and services
    const readings = await dbService.getElectricityReadingsForTenant(id);
    for (const reading of readings) {
      await dbService.deleteElectricityReading(reading.id);
    }
    const services = await dbService.getAdditionalServicesForTenant(id);
    for (const service of services) {
      await dbService.deleteAdditionalService(service.id);
    }
    return deleteItem(DbStore.TENANTS, id);
  },

  // Room operations
  addRoom: (room: Room) => addItem<Room>(DbStore.ROOMS, room),
  getRoom: (id: string) => getItem<Room>(DbStore.ROOMS, id),
  getAllRooms: () => getAllItems<Room>(DbStore.ROOMS),
  updateRoom: (room: Room) => updateItem<Room>(DbStore.ROOMS, room),
  deleteRoom: async (id: string) => {
     // Check if room is occupied, if so, disallow deletion or unassign tenant first.
     // For simplicity here, we'll just delete. A real app might need more checks.
    const tenants = await dbService.getAllTenants();
    const tenantInRoom = tenants.find(t => t.roomId === id);
    if (tenantInRoom) {
        // Unassign tenant from room
        await dbService.updateTenant({...tenantInRoom, roomId: null });
    }
    return deleteItem(DbStore.ROOMS, id);
  },

  // Electricity Reading operations
  addElectricityReading: (reading: ElectricityReading) => addItem<ElectricityReading>(DbStore.ELECTRICITY_READINGS, reading),
  getElectricityReading: (id: string) => getItem<ElectricityReading>(DbStore.ELECTRICITY_READINGS, id),
  getAllElectricityReadings: () => getAllItems<ElectricityReading>(DbStore.ELECTRICITY_READINGS),
  getElectricityReadingsForTenant: (tenantId: string) => getItemsByIndex<ElectricityReading>(DbStore.ELECTRICITY_READINGS, 'tenantId', tenantId),
  updateElectricityReading: (reading: ElectricityReading) => updateItem<ElectricityReading>(DbStore.ELECTRICITY_READINGS, reading),
  deleteElectricityReading: (id: string) => deleteItem(DbStore.ELECTRICITY_READINGS, id),

  // Additional Service operations
  addAdditionalService: (service: AdditionalService) => addItem<AdditionalService>(DbStore.ADDITIONAL_SERVICES, service),
  getAdditionalService: (id: string) => getItem<AdditionalService>(DbStore.ADDITIONAL_SERVICES, id),
  getAllAdditionalServices: () => getAllItems<AdditionalService>(DbStore.ADDITIONAL_SERVICES),
  getAdditionalServicesForTenant: (tenantId: string) => getItemsByIndex<AdditionalService>(DbStore.ADDITIONAL_SERVICES, 'tenantId', tenantId),
  updateAdditionalService: (service: AdditionalService) => updateItem<AdditionalService>(DbStore.ADDITIONAL_SERVICES, service),
  deleteAdditionalService: (id: string) => deleteItem(DbStore.ADDITIONAL_SERVICES, id),
};
