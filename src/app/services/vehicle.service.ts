import { Injectable, inject } from '@angular/core';
import {
  Firestore, addDoc, collection, collectionData,
  deleteDoc, doc, updateDoc, query
} from '@angular/fire/firestore';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Vehicle, VehicleCreate } from '../models/vehicle.model';
import { Timestamp } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private firestore = inject(Firestore);
  
  // Método mejorado para obtener la colección con conversión a Query
  private get vehiclesQuery() {
    return query(collection(this.firestore, 'vehicles'));
  }

  // Crear vehículo optimizado
  async createVehicle(vehicle: VehicleCreate): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.firestore, 'vehicles'), {
        ...vehicle,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      throw this.handleFirestoreError(error, 'Error creating vehicle');
    }
  }

  // Obtener vehículos con conversión segura (versión corregida)
  getAllVehicles(): Observable<Vehicle[]> {
    return collectionData(this.vehiclesQuery, { idField: 'id' }).pipe(
      map(data => data.map(d => this.parseFirestoreDocument(d))),
      catchError(error => 
        throwError(() => this.handleFirestoreError(error, 'Error loading vehicles'))
      )
    );
  }

  // Actualizar con validación mejorada
  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<void> {
    if (!id) throw new Error('ID de vehículo inválido');

    try {
      await updateDoc(doc(this.firestore, 'vehicles', id), {
        ...this.sanitizeUpdateData(data),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      throw this.handleFirestoreError(error, 'Error updating vehicle');
    }
  }

  // Eliminar con verificación robusta
  async deleteVehicle(id: string): Promise<void> {
    if (!id?.trim()) throw new Error('ID inválido');

    try {
      await deleteDoc(doc(this.firestore, 'vehicles', id));
    } catch (error) {
      throw this.handleFirestoreError(error, 'Error deleting vehicle');
    }
  }

  // Métodos auxiliares
  private parseFirestoreDocument(docData: any): Vehicle {
    return {
      id: docData.id,
      plate: docData.plate,
      brand: docData.brand,
      model: docData.model,
      year: docData.year,
      fuelType: docData.fuelType,
      owner: docData.owner,
      createdAt: this.convertTimestamp(docData.createdAt),
      updatedAt: this.convertTimestamp(docData.updatedAt)
    };
  }

  private convertTimestamp(field: Timestamp | Date): Date {
    return field instanceof Timestamp ? field.toDate() : field;
  }

  private sanitizeUpdateData(data: Partial<Vehicle>): Partial<VehicleCreate> {
    const { id, createdAt, updatedAt, ...safeData } = data;
    return safeData;
  }

  private handleFirestoreError(error: unknown, context: string): Error {
    console.error(`[Firestore Error] ${context}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return new Error(`${context}: ${errorMessage}`);
  }
}