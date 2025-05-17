import { Component, EventEmitter, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

// Decorador Componente: define metadatos del componente
@Component({
  selector: 'app-auth-facebook', // Selector para usar en templates
  standalone: true, // Indica que es un componente standalone
  templateUrl: './auth-facebook.component.html', // Template asociado
  styleUrls: ['./auth-facebook.component.css'] // Estilos asociados
})
export class AuthFacebookComponent {
  @Output() authSuccess = new EventEmitter<void>(); // Evento emitido al autenticar con éxito
  private authService = inject(AuthService); // Inyección del servicio de autenticación
  private router = inject(Router); // Inyección del router para navegación

  // Método para iniciar sesión con Facebook
  async signInWithFacebook() {
    // Mostrar loading mientras se procesa la autenticación
    const loadingSwal = Swal.fire({
      title: 'Conectando con Facebook',
      allowOutsideClick: false, // Evitar que el usuario cierre el modal
      showConfirmButton: false, // Ocultar botón de confirmación
      willOpen: () => {
        Swal.showLoading(); // Mostrar spinner de carga
      }
    });

    try {
      // Intentar autenticación con Facebook mediante el servicio
      await this.authService.loginWithFacebook();
      
      // Cerrar loading y mostrar mensaje de éxito
      await loadingSwal;
      Swal.close();
      
      this.showSuccessAlert(); // Mostrar alerta de éxito
      this.authSuccess.emit(); // Emitir evento de autenticación exitosa
      this.navigateToDashboard(); // Redirigir al dashboard
      
    } catch (error) {
      console.error('Error en componente Facebook:', error);
      Swal.close(); // Cerrar loading en caso de error
      // El servicio ya maneja el error, no es necesario hacerlo aquí nuevamente
    }
  }

  // Muestra alerta de autenticación exitosa
  private showSuccessAlert(): void {
    Swal.fire({
      position: 'top-end', // Posición en esquina superior derecha
      icon: 'success', // Icono de éxito
      title: 'Autenticación con Facebook exitosa!',
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

  // Maneja errores de autenticación (aunque actualmente no se usa directamente)
  private handleAuthError(error: any): void {
    console.error('Error en autenticación con Facebook:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo autenticar con Facebook. Inténtalo de nuevo.',
    });
  }
}