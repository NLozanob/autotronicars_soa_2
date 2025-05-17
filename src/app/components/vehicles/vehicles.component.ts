import { 
  Component, inject, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef 
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
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
  @ViewChild('vehicleForm') vehicleForm!: NgForm;
  @ViewChild('vehicleModal') modal!: ElementRef;
  
  private vehicleService = inject(VehicleService);
  private cdr = inject(ChangeDetectorRef);
  private modalInstance?: bootstrap.Modal;

  // Datos y estado
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
    }
    this.modalInstance?.show();
  }

  async saveVehicle() {
    if (!this.vehicleForm.valid) return;
    
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
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error guardando vehículo:', error);
      alert('Error al guardar. Verifica la consola para detalles.');
    } finally {
      this.isSaving = false;
    }
  }

  async deleteVehicle(id: string) {
    if (!id || !confirm('¿Estás seguro de eliminar este vehículo?')) return;
    
    this.isDeleting = id;
    try {
      await this.vehicleService.deleteVehicle(id);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Error eliminando vehículo:', error);
      alert('Error al eliminar. Verifica la consola para detalles.');
    } finally {
      this.isDeleting = null;
    }
  }

  private initVehicle(): Partial<Vehicle> {
    return {
      year: this.currentYear,
      fuelType: 'Gasolina'
    };
  }

  private prepareVehicleData(): VehicleCreate {
    const requiredFields = ['plate', 'brand', 'model', 'year', 'fuelType', 'owner'];
    const missingFields = requiredFields.filter(field => !this.newVehicle[field as keyof Vehicle]);

    if (missingFields.length > 0) {
      throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
    }

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
    this.vehicleForm.resetForm();
    this.newVehicle = this.initVehicle();
    this.isEditing = false;
  }
}