// Importaciones necesarias
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

// Decorador del componente
@Component({
  selector: 'app-auth-github', // Selector HTML para usar este componente
  standalone: true, // Indica que es un componente standalone (Angular 14+)
  templateUrl: './auth-github.component.html', // Plantilla asociada
  styleUrls: ['./auth-github.component.css'] // Estilos CSS asociados
})
export class AuthGithubComponent {
  // Evento emitido cuando la autenticación es exitosa
  @Output() authSuccess = new EventEmitter<void>();
  
  // Inyección de dependencias
  private authService = inject(AuthService); // Servicio de autenticación
  private router = inject(Router); // Router para navegación

  // Método principal para iniciar sesión con GitHub
  async signInWithGithub() {
    try {
      // 1. Intenta autenticar con GitHub usando el servicio
      await this.authService.loginWithGithub();
      
      // 2. Muestra alerta de éxito
      this.showSuccessAlert();
      
      // 3. Emite evento de autenticación exitosa
      this.authSuccess.emit();
      
      // 4. Navega al dashboard
      this.navigateToDashboard();
    } catch (error) {
      // Manejo de errores
      this.handleAuthError(error);
    }
  }

  // Muestra una alerta de éxito usando SweetAlert2
  private showSuccessAlert(): void {
    Swal.fire({
      position: 'top-end', // Posición en la esquina superior derecha
      icon: 'success', // Icono de éxito
      title: 'Autenticación con GitHub exitosa!', // Título
      showConfirmButton: false, // Sin botón de confirmación
      timer: 1500 // Cierra automáticamente después de 1.5 segundos
    });
  }

  // Navega al dashboard después de un breve retraso
  private navigateToDashboard(): void {
    setTimeout(() => {
      this.router.navigate(['/dashboard']); // Navegación programática
    }, 1500); // Espera 1.5 segundos antes de redirigir
  }

  // Maneja errores de autenticación
  private handleAuthError(error: any): void {
    console.error('Error en autenticación con GitHub:', error); // Log del error
    
    // Muestra alerta de error al usuario
    Swal.fire({
      icon: 'error', // Icono de error
      title: 'Error', // Título
      text: 'No se pudo autenticar con GitHub. Inténtalo de nuevo.', // Mensaje
    });
  }
}