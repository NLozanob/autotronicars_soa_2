//Funciones necesarias desde Angular y Firebase
import { Injectable, inject } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, updateDoc, query } from '@angular/fire/firestore';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Vehicle, VehicleCreate } from '../models/vehicle.model';
import { Timestamp } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' }) //Indica que este servicio está disponible a nivel de toda la aplicación
export class VehicleService {
  private firestore = inject(Firestore); // Servicio Firestore de Firebase
  
  // Retorna una consulta (query) sobre la colección 'vehicles' en Firestore.
  private get vehiclesQuery() {
    return query(collection(this.firestore, 'vehicles'));
  }

  // Crea un nuevo vehículo en la colección 'vehicles'.
  async createVehicle(vehicle: VehicleCreate): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.firestore, 'vehicles'), {
        ...vehicle,
        createdAt: Timestamp.now(), // Marca de tiempo de creación
        updatedAt: Timestamp.now()  // Marca de tiempo de actualización
      });
      return docRef.id;
    } catch (error) {
      throw this.handleFirestoreError(error, 'Error creating vehicle');
    }
  }

 // Obtiene todos los vehículos desde Firestore.
  getAllVehicles(): Observable<Vehicle[]> {
    return collectionData(this.vehiclesQuery, { idField: 'id' }).pipe(
      map(data => data.map(d => this.parseFirestoreDocument(d))), // Transforma los datos en objetos Vehicle
      catchError(error => 
        throwError(() => this.handleFirestoreError(error, 'Error loading vehicles')) // Manejo de errores
      )
    );
  }

 // Actualiza los datos de un vehículo en la base de datos.
  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<void> {
    if (!id) throw new Error('ID de vehículo inválido');

    try {
      await updateDoc(
        doc(this.firestore, 'vehicles', id), 
        {
          ...this.sanitizeUpdateData(data), // Elimina campos no modificables
          updatedAt: Timestamp.now() // Actualiza la fecha de modificación
        }
      );
    } catch (error) {
      throw this.handleFirestoreError(error, 'Error updating vehicle');
    }
  }

  // Elimina un vehículo de la base de datos.
  async deleteVehicle(id: string): Promise<void> {
    if (!id?.trim()) throw new Error('ID inválido');

    try {
      await deleteDoc(doc(this.firestore, 'vehicles', id));
    } catch (error) {
      throw this.handleFirestoreError(error, 'Error deleting vehicle');
    }
  }

  // Transforma un documento de Firestore en un objeto Vehicle.
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

  // Convierte un Timestamp de Firestore a un objeto Date.
  private convertTimestamp(field: Timestamp | Date): Date {
    return field instanceof Timestamp ? field.toDate() : field;
  }

  // Limpia los datos a actualizar, eliminando campos que no deben modificarse.
  private sanitizeUpdateData(data: Partial<Vehicle>): Partial<VehicleCreate> {
    const { id, createdAt, updatedAt, ...safeData } = data;
    return safeData;
  }

  // Maneja errores de Firestore.
  private handleFirestoreError(error: unknown, context: string): Error {
    console.error(`[Firestore Error] ${context}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return new Error(`${context}: ${errorMessage}`);
  }
}
