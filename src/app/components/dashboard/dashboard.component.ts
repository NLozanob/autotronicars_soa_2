import { Component, inject } from '@angular/core';
import { VehicleService } from '../../services/vehicle.service';
import { AsyncPipe } from '@angular/common';

@Component({
  standalone: true,
  imports: [AsyncPipe], // Añadir AsyncPipe para usar en el template
  template: `
    <div class="dashboard">
      <!-- Usar variable del componente en lugar de llamar al servicio directamente -->
      <h2>Total de Vehículos: {{ (vehicles$ | async)?.length ?? 0 }}</h2>
    </div>
  `,
  styles: [
    `
      .dashboard {
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 0.5rem;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
      
      h2 {
        color: #333;
        font-size: 1.25rem;
        margin: 0;
      }
    `
  ]
})
export class DashboardComponent {
  protected vehicleService = inject(VehicleService);
  
  // Mejor práctica: Almacenar el observable en una propiedad
  vehicles$ = this.vehicleService.getAllVehicles();
}