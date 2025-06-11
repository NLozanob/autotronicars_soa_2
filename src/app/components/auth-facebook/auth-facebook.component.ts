// Importaciones necesarias desde Angular y librerías externas
import { Component, EventEmitter, Output, inject } from '@angular/core'; 
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-facebook',
  standalone: true,
  templateUrl: './auth-facebook.component.html',
  styleUrls: ['./auth-facebook.component.css']
})
export class AuthFacebookComponent {
  @Output() authSuccess = new EventEmitter<void>();
  private authService = inject(AuthService);
  private router = inject(Router);

  async signInWithFacebook() {
  // Mostrar loading
  const loadingSwal = Swal.fire({
    title: 'Conectando con Facebook',
    allowOutsideClick: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    await this.authService.loginWithFacebook();
    
    // Cerrar loading y mostrar éxito
    await loadingSwal;
    Swal.close();
    
    this.showSuccessAlert();
    this.authSuccess.emit();
    this.navigateToDashboard();
    
  } catch (error) {
    console.error('Error en componente Facebook:', error);
    Swal.close(); // Asegurarse de cerrar el loading en caso de error
    // El error ya fue manejado por el servicio
  }
}

  private showSuccessAlert(): void {
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Autenticación con Facebook exitosa!',
      showConfirmButton: false,
      timer: 1500
    });
  }

  private navigateToDashboard(): void {
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1500);
  }

  private handleAuthError(error: any): void {
    console.error('Error en autenticación con Facebook:', error); 
    Swal.fire({
      icon: 'error', 
      title: 'Error',
      text: 'No se pudo autenticar con Facebook. Inténtalo de nuevo.',
    });
  }
}
