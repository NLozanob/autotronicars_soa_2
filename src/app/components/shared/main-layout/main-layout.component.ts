import { Component, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export class MainLayoutComponent {
  isSidebarCollapsed = false;
  currentPageTitle = '';

  private pageTitles: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/vehicles': 'Gestión de Vehículos'
  };

  private router = inject(Router);

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentPageTitle = this.pageTitles[event.urlAfterRedirects] || 'AutotroniCars';
      });
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}