import { Component, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle, VehicleCreate } from '../../models/vehicle.model';
import * as bootstrap from 'bootstrap';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css']
})
export class VehiclesComponent implements AfterViewInit {
  private vehicleService = inject(VehicleService);
  private modalInstance?: bootstrap.Modal; // Cambiado a bootstrap.Modal
  
  @ViewChild('vehicleModal') modal!: ElementRef;
  
  // Datos
  vehicles$ = this.vehicleService.getAllVehicles();
  currentYear = new Date().getFullYear();
  fuelTypes = ['Gasolina', 'Diésel', 'Eléctrico', 'Híbrido'];
  
  // Estado del formulario
  isEditing = false;
  isSaving = false;
  newVehicle: Partial<Vehicle> = {
    year: this.currentYear,
    fuelType: 'Gasolina'
  };

  ngAfterViewInit() {
    this.modalInstance = new bootstrap.Modal(this.modal.nativeElement); // Usando bootstrap.Modal
  }

  openModal(vehicle?: Vehicle) {
    this.resetForm();
    if (vehicle) {
      this.isEditing = true;
      this.newVehicle = { ...vehicle };
    }
    this.modalInstance?.show();
  }

  async saveVehicle() {
    this.isSaving = true;
    try {
      const vehicleData = this.prepareVehicleData();
      
      if (this.isEditing && this.newVehicle.id) {
        await this.vehicleService.updateVehicle(this.newVehicle.id, vehicleData);
      } else {
        await this.vehicleService.createVehicle(vehicleData);
      }
      
      this.modalInstance?.hide();
      this.resetForm();
    } catch (error) {
      console.error('Error guardando vehículo:', error);
    } finally {
      this.isSaving = false;
    }
  }

  deleteVehicle(id: string) {
    if (confirm('¿Estás seguro de eliminar este vehículo?')) {
      this.vehicleService.deleteVehicle(id);
    }
  }

  private prepareVehicleData(): VehicleCreate {
    return {
      plate: this.newVehicle.plate!,
      brand: this.newVehicle.brand!,
      model: this.newVehicle.model!,
      year: this.newVehicle.year!,
      fuelType: this.newVehicle.fuelType!,
      owner: this.newVehicle.owner!
    };
  }

  private resetForm() {
    this.newVehicle = {
      year: this.currentYear,
      fuelType: 'Gasolina'
    };
    this.isEditing = false;
  }
}