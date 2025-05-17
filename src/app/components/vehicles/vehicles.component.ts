// Utilidades de Angular para definir el componente y manipular el DOM
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
// Define el componente Angular como standalone y sus metadatos

export class VehiclesComponent implements AfterViewInit {
  @ViewChild('vehicleForm') vehicleForm!: NgForm; // Formulario en la plantilla HTML
  @ViewChild('vehicleModal') modal!: ElementRef; // Elemento modal en el DOM

  private vehicleService = inject(VehicleService); // Inyección del servicio de vehículos
  private modalInstance?: bootstrap.Modal;

  vehicles$ = this.vehicleService.getAllVehicles(); // Obtiene la lista de vehículos desde el servicio
  currentYear = new Date().getFullYear();
  fuelTypes = ['Gasolina', 'Diésel', 'Eléctrico', 'Híbrido'];
  isEditing = false;
  isSaving = false;
  isDeleting: string | null = null;
  newVehicle: Partial<Vehicle> = this.initVehicle(); // Representa el vehículo a crear o editar
  

  ngAfterViewInit() {
    this.modalInstance = new bootstrap.Modal(this.modal.nativeElement);
  }

  openModal(vehicle?: Vehicle) { // Limpia el formulario
    this.resetForm();
    
    if (vehicle) {
      this.isEditing = true;
      this.newVehicle = { ...vehicle };
    } else {
      this.isEditing = false;
    }
    this.modalInstance?.show();
  }

  async saveVehicle() { // Verifica si el formulario es válido
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
      const vehicleData = this.prepareVehicleData(); // Prepara los datos para enviarlos
      
      if (this.isEditing && this.newVehicle.id) {
        await this.vehicleService.updateVehicle(this.newVehicle.id, vehicleData); // Actualiza un vehículo existente
        
        await Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'Vehículo actualizado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        await this.vehicleService.createVehicle(vehicleData); // Crea un nuevo vehículo
        
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
      console.error('Error guardando vehículo:', error); // Muestra mensaje de error si algo falla
      
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
    if (!id) return; // Verifica si el ID es válido

    const { isConfirmed } = await Swal.fire({ // Muestra confirmación antes de eliminar
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

    this.isDeleting = id;  // Indica que se está eliminando este vehículo

    try {
      await this.vehicleService.deleteVehicle(id); // Elimina el vehículo desde el servicio

      await Swal.fire({
        icon: 'success',
        title: '¡Eliminado!',
        text: 'Vehículo eliminado correctamente',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error eliminando vehículo:', error); // Muestra error si falla la eliminación
      
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al eliminar el vehículo',
        confirmButtonColor: '#d33'
      });
    } finally {
      this.isDeleting = null; // Limpia el estado de eliminación
    }
  }

  showVehicleDetails(vehicle: Vehicle) { // Muestra los detalles del vehículo
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

  private initVehicle(): Partial<Vehicle> { // Inicializa los campos de un nuevo vehículo con valores por defecto
    return {
      plate: '',
      brand: '',
      model: '',
      year: this.currentYear,
      fuelType: 'Gasolina',
      owner: ''
    };
  }

  private prepareVehicleData(): VehicleCreate { // Prepara y asegura que los campos obligatorios tengan valores válidos
    return {
      plate: this.newVehicle.plate || '',
      brand: this.newVehicle.brand || '',
      model: this.newVehicle.model || '',
      year: this.newVehicle.year || this.currentYear,
      fuelType: this.newVehicle.fuelType || 'Gasolina',
      owner: this.newVehicle.owner || ''
    };
  }

  private resetForm() { // Resetea el formulario si está definido
    if (this.vehicleForm) {
      this.vehicleForm.resetForm();
    }

    this.newVehicle = this.initVehicle(); // Reinicia los valores del vehículo

    this.isEditing = false; // Desactiva el modo edición
  }
}
