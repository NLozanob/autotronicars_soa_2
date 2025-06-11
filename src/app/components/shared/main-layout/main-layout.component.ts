// Importaciones de Angular y módulos necesarios
import { Component, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Decorador del componente
@Component({
  standalone: true, // Indica que es un componente independiente
  imports: [
    CommonModule, // Proporciona directivas comunes como ngIf, ngFor
    RouterModule // Para usar directivas de router como routerLink
  ],
  selector: 'app-main-layout', // Selector para usar en templates
  templateUrl: './main-layout.component.html', // Plantilla asociada
  styleUrls: ['./main-layout.component.css'] // Estilos CSS asociados
})
export class MainLayoutComponent {
  // Estado del sidebar (colapsado o expandido)
  isSidebarCollapsed = false;
  
  // Título actual de la página
  currentPageTitle = '';

  // Mapeo de URLs a títulos de página
  private pageTitles: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/vehicles': 'Gestión de Vehículos'
    // Puedes añadir más rutas y títulos según sea necesario
  };

  // Inyección del servicio Router
  private router = inject(Router);

  constructor() {
    // Suscripción a eventos de navegación del router
    this.router.events
      .pipe(
        // Filtra solo los eventos de NavigationEnd (cuando termina una navegación)
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: any) => {
        // Actualiza el título según la URL actual
        this.currentPageTitle = this.pageTitles[event.urlAfterRedirects] || 'AutotroniCars';
        // 'AutotroniCars' es el título por defecto si no se encuentra la ruta
      });
  }

  // Método para alternar (mostrar/ocultar) el sidebar
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}