// auth-github.component.ts
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-github',
  standalone: true,
  templateUrl: './auth-github.component.html',
  styleUrls: ['./auth-github.component.css']
})
export class AuthGithubComponent {
  @Output() authSuccess = new EventEmitter<void>();
  private authService = inject(AuthService);
  private router = inject(Router);

  async signInWithGithub() {
    try {
      await this.authService.loginWithGithub();
      this.showSuccessAlert();
      this.authSuccess.emit();
      this.navigateToDashboard();
    } catch (error) {
      this.handleAuthError(error);
    }
  }

  private showSuccessAlert(): void {
    Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: 'Autenticación con GitHub exitosa!',
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
    console.error('Error en autenticación con GitHub:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo autenticar con GitHub. Inténtalo de nuevo.',
    });
  }
}