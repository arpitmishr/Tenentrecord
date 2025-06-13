export interface Tenant {
  id: string;
  name: string;
  contact?: string;
  moveInDate: string; // ISO date string
  isVerified: boolean;
  roomId: string | null; 
}

export interface Room {
  id: string;
  roomNumber: string;
  rentRate: number;
  currentTenantId?: string | null; // Added to track tenant occupying the room
}

export interface ElectricityReading {
  id: string;
  tenantId: string;
  roomId: string; // Keep roomId for context even if tenant moves
  date: string; // YYYY-MM format for month
  previousUnit: number;
  currentUnit: number;
  unitsConsumed: number;
  ratePerUnit: number;
  totalCharge: number;
  isPaid: boolean;
}

export interface AdditionalService {
  id: string;
  tenantId: string;
  description: string;
  charge: number;
  date: string; // ISO date string
  isPaid: boolean;
}

export enum DbStore {
  TENANTS = 'tenants',
  ROOMS = 'rooms',
  ELECTRICITY_READINGS = 'electricityReadings',
  ADDITIONAL_SERVICES = 'additionalServices',
}
