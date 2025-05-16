export interface Vehicle {
  id?: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  fuelType: string;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
}

export type VehicleCreate = Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>;