import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { VehiclesComponent } from './components/vehicles/vehicles.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { AuthGuard } from './guards/auth.guard';
import { MainLayoutComponent } from './components/shared/main-layout/main-layout.component';

export const routes: Routes = [
  // Rutas públicas sin layout
  { path: '', component: WelcomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },

  // Rutas privadas con layout (sidebar)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard], // Protege todas las rutas hijas
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'vehicles', component: VehiclesComponent },
      {
        path: 'user-log',
        loadComponent: () => import('./components/user-log-viewer/user-log-viewer.component').then(m => m.UserLogViewerComponent)
      },
    ]
  },

  // Redirecciones
  { path: '**', redirectTo: '' } // Redirige rutas desconocidas a Welcome
];