// Importaciones necesarias desde Angular y librerías externas
import { Component, EventEmitter, Output, inject } from '@angular/core'; 
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

// Componente de autenticación con Facebook
@Component({
  selector: 'app-auth-facebook', // Selector para usar el componente en HTML
  standalone: true, // Componente independiente, no necesita estar en un módulo
  templateUrl: './auth-facebook.component.html', // Ruta de la plantilla HTML
  styleUrls: ['./auth-facebook.component.css'] // Ruta de los estilos CSS
})
export class AuthFacebookComponent { // Notifica cuando la autenticación es exitosa
  @Output() authSuccess = new EventEmitter<void>();

  
  private authService = inject(AuthService); // Servicio de autenticación
  private router = inject(Router); 

  // Proceso de inicio de sesión con Facebook
  async signInWithFacebook() {
    
    const loadingSwal = Swal.fire({ // Mostrar una alerta tipo "loading" mientras se realiza la conexión
      title: 'Conectando con Facebook', 
      allowOutsideClick: false, 
      showConfirmButton: false, 
      willOpen: () => {
        Swal.showLoading(); 
      }
    });

    try {
      // Intentar iniciar sesión con Facebook a través del servicio
      await this.authService.loginWithFacebook();

      // Esperar a que se muestre el loading y luego cerrarlo
      await loadingSwal;
      Swal.close();

      // Mostrar alerta de éxito
      this.showSuccessAlert();

      // Emitir evento para notificar autenticación exitosa
      this.authSuccess.emit();

      // Redirigir al dashboard después de la autenticación
      this.navigateToDashboard();

    } catch (error) {
      console.error('Error en componente Facebook:', error);
      Swal.close();
    }
  }

  // Método privado que muestra una alerta de éxito en la esquina superior
  private showSuccessAlert(): void {
    Swal.fire({
      position: 'top-end', 
      icon: 'success', 
      title: 'Autenticación con Facebook exitosa!',
      showConfirmButton: false, 
      timer: 1500 
    });
  }

  // Método privado que navega al dashboard luego de un pequeño retraso
  private navigateToDashboard(): void {
    setTimeout(() => {
      this.router.navigate(['/dashboard']); // Redireccionar
    }, 1500); 
  }

  // Método privado que maneja errores de autenticación mostrando una alerta
  private handleAuthError(error: any): void {
    console.error('Error en autenticación con Facebook:', error); 
    Swal.fire({
      icon: 'error', 
      title: 'Error',
      text: 'No se pudo autenticar con Facebook. Inténtalo de nuevo.',
    });
  }
}
