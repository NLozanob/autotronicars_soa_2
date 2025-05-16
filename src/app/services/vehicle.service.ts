import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { Observable, catchError, from, map, throwError } from 'rxjs';
import { Vehicle, VehicleCreate } from '../models/vehicle.model';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private firestore = inject(Firestore);
  private vehiclesCollection = collection(this.firestore, 'vehicles');

  // Crear vehículo con manejo de errores mejorado
  async createVehicle(vehicle: VehicleCreate): Promise<string> {
    try {
      const timestamp = new Date();
      const docRef = await addDoc(this.vehiclesCollection, {
        ...vehicle,
        createdAt: timestamp,
        updatedAt: timestamp
      });
      return docRef.id;
    } catch (error) {
      throw this.handleFirestoreError(error, 'Error creating vehicle');
    }
  }

  // Obtener todos los vehículos con tipado seguro
  getAllVehicles(): Observable<Vehicle[]> {
    return collectionData(this.vehiclesCollection, { idField: 'id' }).pipe(
      map(data => data as Vehicle[]),
      catchError(error => {
        throw this.handleFirestoreError(error, 'Error loading vehicles');
      })
    );
  }

  // Actualizar con validación de campos
  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<void> {
    try {
      const docRef = doc(this.firestore, `vehicles/${id}`);
      const updateData = this.sanitizeUpdateData(data);
      
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: new Date()
      });
    } catch (error) {
      throw this.handleFirestoreError(error, 'Error updating vehicle');
    }
  }

  // Eliminar con verificación de ID
  async deleteVehicle(id: string): Promise<void> {
    if (!id) throw new Error('Invalid vehicle ID');
    
    try {
      const docRef = doc(this.firestore, `vehicles/${id}`);
      await deleteDoc(docRef);
    } catch (error) {
      throw this.handleFirestoreError(error, 'Error deleting vehicle');
    }
  }

  // Métodos privados de ayuda
  private sanitizeUpdateData(data: Partial<Vehicle>): Partial<Vehicle> {
    const { id, createdAt, ...safeData } = data;
    return safeData;
  }

  private handleFirestoreError(error: unknown, context: string): Error {
    console.error(`${context}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Error(`${context}: ${errorMessage}`);
  }
}