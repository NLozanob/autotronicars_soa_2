import { Component, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VehicleService } from '../../services/vehicle.service';
import { Vehicle, VehicleCreate } from '../../models/vehicle.model';
import * as bootstrap from 'bootstrap';
import Swal from 'sweetalert2';

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
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor complete todos los campos requeridos',
        confirmButtonColor: '#d33'
      });
      return;
    }
    
    this.isSaving = true;
    try {
      const vehicleData = this.prepareVehicleData();

      if (this.isEditing && this.newVehicle.id) {
        await this.vehicleService.updateVehicle(this.newVehicle.id, vehicleData);
        await Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'Vehículo actualizado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await this.vehicleService.createVehicle(vehicleData);
        await Swal.fire({
          icon: 'success',
          title: '¡Creado!',
          text: 'Vehículo creado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      }

      this.modalInstance?.hide();
      this.resetForm();
    } catch (error) {
      console.error('Error guardando vehículo:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al guardar el vehículo',
        confirmButtonColor: '#d33'
      });
    } finally {
      this.isSaving = false;
    }
  }

  async deleteVehicle(id: string) {
    if (!id) return;
    
    const { isConfirmed } = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esta acción!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!isConfirmed) return;
    
    this.isDeleting = id;
    try {
      await this.vehicleService.deleteVehicle(id);
      await Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: 'Vehículo eliminado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error eliminando vehículo:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al eliminar el vehículo',
        confirmButtonColor: '#d33'
      });
    } finally {
      this.isDeleting = null;
    }
  }

  showVehicleDetails(vehicle: Vehicle) {
    Swal.fire({
      title: `Detalles del Vehículo - ${vehicle.plate}`,
      html: `
        <div class="container text-start">
          <div class="row">
            <div class="col-md-6">
              <div class="card mb-3">
                <div class="card-header bg-light">
                  <h6 class="mb-0">Información Básica</h6>
                </div>
                <div class="card-body">
                  <p><strong><i class="bi bi-tag"></i> Marca:</strong> ${vehicle.brand}</p>
                  <p><strong><i class="bi bi-box-seam"></i> Modelo:</strong> ${vehicle.model}</p>
                  <p><strong><i class="bi bi-calendar"></i> Año:</strong> ${vehicle.year}</p>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card">
                <div class="card-header bg-light">
                  <h6 class="mb-0">Detalles Adicionales</h6>
                </div>
                <div class="card-body">
                  <p><strong><i class="bi bi-fuel-pump"></i> Combustible:</strong> ${vehicle.fuelType}</p>
                  <p><strong><i class="bi bi-person"></i> Propietario:</strong> ${vehicle.owner}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Cerrar',
      width: '700px',
      customClass: {
        popup: 'vehicle-details-popup'
      }
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