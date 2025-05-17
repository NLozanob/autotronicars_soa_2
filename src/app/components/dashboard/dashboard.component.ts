import { Component, inject } from '@angular/core';
import { VehicleService } from '../../services/vehicle.service';
import { CommonModule } from '@angular/common'; // Quitamos AsyncPipe
import { tap } from 'rxjs/operators';

@Component({
  standalone: true,
  imports: [CommonModule], // Solo CommonModule
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  protected vehicleService = inject(VehicleService);
  
  stats = {
    totalVehicles: 0,
    activeMaintenance: 0,
    recentClients: 0,
    vehiclesChange: 8,
    maintenanceChange: 3,
    clientsChange: 15
  };

  vehicles: any[] = [];

  // Mantenemos la subscripción directa en el componente
  constructor() {
    this.vehicleService.getAllVehicles().pipe(
      tap(vehicles => {
        this.stats.totalVehicles = vehicles.length;
        this.vehicles = vehicles.slice(-5);
      })
    ).subscribe();
  }

  getCurrentDate() {
    return new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}