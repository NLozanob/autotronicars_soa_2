import { Component, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle, VehicleCreate } from '../../models/vehicle.model';
import * as bootstrap from 'bootstrap';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css']
})
export class VehiclesComponent implements AfterViewInit {
  @ViewChild('vehicleForm') vehicleForm!: NgForm;
  @ViewChild('vehicleModal') modal!: ElementRef;
  
  private vehicleService = inject(VehicleService);
  private toastr = inject(ToastrService);
  private modalInstance?: bootstrap.Modal;

  vehicles$ = this.vehicleService.getAllVehicles();
  currentYear = new Date().getFullYear();
  fuelTypes = ['Gasolina', 'Diésel', 'Eléctrico', 'Híbrido'];
  isEditing = false;
  isSaving = false;
  isDeleting: string | null = null;
  newVehicle: Partial<Vehicle> = this.initVehicle();

  ngAfterViewInit() {
    this.modalInstance = new bootstrap.Modal(this.modal.nativeElement);
  }

  openModal(vehicle?: Vehicle) {
    this.resetForm();
    if (vehicle) {
      this.isEditing = true;
      this.newVehicle = { ...vehicle };
    } else {
      this.isEditing = false;
    }
    this.modalInstance?.show();
  }

  async saveVehicle() {
    if (!this.vehicleForm.valid) {
      this.toastr.warning('Por favor complete todos los campos requeridos');
      return;
    }
    
    this.isSaving = true;
    try {
      const vehicleData = this.prepareVehicleData();

      if (this.isEditing && this.newVehicle.id) {
        await this.vehicleService.updateVehicle(this.newVehicle.id, vehicleData);
        this.toastr.success('Vehículo actualizado correctamente');
      } else {
        await this.vehicleService.createVehicle(vehicleData);
        this.toastr.success('Vehículo creado correctamente');
      }

      this.modalInstance?.hide();
      this.resetForm();
    } catch (error) {
      console.error('Error guardando vehículo:', error);
      this.toastr.error('Error al guardar el vehículo');
    } finally {
      this.isSaving = false;
    }
  }

  async deleteVehicle(id: string) {
    if (!id) return;
    
    const confirmed = await this.showDeleteConfirmation();
    if (!confirmed) return;
    
    this.isDeleting = id;
    try {
      await this.vehicleService.deleteVehicle(id);
      this.toastr.success('Vehículo eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando vehículo:', error);
      this.toastr.error('Error al eliminar el vehículo');
    } finally {
      this.isDeleting = null;
    }
  }

  private async showDeleteConfirmation(): Promise<boolean> {
    return new Promise((resolve) => {
      // Puedes implementar un modal de confirmación más elegante aquí
      const confirmed = confirm('¿Estás seguro de eliminar este vehículo?');
      resolve(confirmed);
    });
  }

  private initVehicle(): Partial<Vehicle> {
    return {
      plate: '',
      brand: '',
      model: '',
      year: this.currentYear,
      fuelType: 'Gasolina',
      owner: ''
    };
  }

  private prepareVehicleData(): VehicleCreate {
    return {
      plate: this.newVehicle.plate || '',
      brand: this.newVehicle.brand || '',
      model: this.newVehicle.model || '',
      year: this.newVehicle.year || this.currentYear,
      fuelType: this.newVehicle.fuelType || 'Gasolina',
      owner: this.newVehicle.owner || ''
    };
  }

  private resetForm() {
    if (this.vehicleForm) {
      this.vehicleForm.resetForm();
    }
    this.newVehicle = this.initVehicle();
    this.isEditing = false;
  }
}